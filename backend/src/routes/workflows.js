const express = require("express");
const router = express.Router();
const { body, query, param, validationResult } = require("express-validator");
const { authorize } = require("../middleware/auth");
const { db } = require("../config/database");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");
const { auditLogger } = require("../utils/auditLogger");

// Mock data for workflows (could be database-backed in future)
let workflows = [
  {
    id: 1,
    name: "Aprovação de Reserva Premium",
    description:
      "Workflow para aprovação automática de reservas acima de R$ 2000",
    status: "active",
    type: "approval",
    triggers: ["booking_created", "payment_pending"],
    conditions: [
      { field: "total_amount", operator: ">", value: 2000 },
      { field: "vip_level", operator: "in", value: ["gold", "platinum"] },
    ],
    actions: [
      { type: "notify_manager", delay: 0 },
      { type: "auto_approve", delay: 3600 }, // 1 hour
      { type: "send_confirmation", delay: 3660 },
    ],
    created_by: 1,
    created_at: new Date("2025-01-01"),
    execution_count: 25,
    success_rate: 96.0,
  },
  {
    id: 2,
    name: "Follow-up Pós-Viagem",
    description: "Envia pesquisa de satisfação 3 dias após o checkout",
    status: "active",
    type: "notification",
    triggers: ["booking_completed"],
    conditions: [{ field: "checkout_date", operator: "passed_days", value: 3 }],
    actions: [
      { type: "send_satisfaction_survey", delay: 259200 }, // 3 days
      { type: "request_review", delay: 345600 }, // 4 days
    ],
    created_by: 1,
    created_at: new Date("2025-01-01"),
    execution_count: 42,
    success_rate: 89.5,
  },
  {
    id: 3,
    name: "Processo de Cancelamento",
    description: "Gerencia cancelamentos com reembolso automático",
    status: "active",
    type: "automation",
    triggers: ["cancellation_requested"],
    conditions: [
      { field: "cancellation_date", operator: "days_before_checkin", value: 7 },
    ],
    actions: [
      { type: "calculate_refund", delay: 0 },
      { type: "process_refund", delay: 3600 },
      { type: "update_availability", delay: 3600 },
      { type: "notify_customer", delay: 7200 },
    ],
    created_by: 1,
    created_at: new Date("2025-01-01"),
    execution_count: 8,
    success_rate: 100.0,
  },
];

/**
 * @swagger
 * /api/workflows:
 *   get:
 *     tags: [Workflows]
 *     summary: Get all workflows
 */
router.get(
  "/",
  [
    authorize(["admin", "manager"]),
    query("status").optional().isIn(["active", "inactive", "draft"]),
    query("type").optional().isIn(["approval", "notification", "automation"]),
  ],
  asyncHandler(async (req, res) => {
    const { status, type } = req.query;

    let filteredWorkflows = [...workflows];

    if (status) {
      filteredWorkflows = filteredWorkflows.filter((w) => w.status === status);
    }

    if (type) {
      filteredWorkflows = filteredWorkflows.filter((w) => w.type === type);
    }

    res.json({
      success: true,
      data: {
        workflows: filteredWorkflows,
        count: filteredWorkflows.length,
        summary: {
          total: workflows.length,
          active: workflows.filter((w) => w.status === "active").length,
          types: {
            approval: workflows.filter((w) => w.type === "approval").length,
            notification: workflows.filter((w) => w.type === "notification")
              .length,
            automation: workflows.filter((w) => w.type === "automation").length,
          },
        },
      },
    });
  }),
);

/**
 * @swagger
 * /api/workflows/{id}:
 *   get:
 *     tags: [Workflows]
 *     summary: Get workflow by ID
 */
router.get(
  "/:id",
  [authorize(["admin", "manager"]), param("id").isInt({ min: 1 }).toInt()],
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const workflow = workflows.find((w) => w.id === parseInt(id));

    if (!workflow) {
      throw new AppError("Workflow not found", 404, "WORKFLOW_NOT_FOUND");
    }

    // Get execution history (mock data)
    const executionHistory = [
      {
        id: 1,
        execution_date: new Date(),
        status: "completed",
        trigger_data: { booking_id: 123, total_amount: 2500 },
        duration: 1250,
        actions_executed: 3,
      },
      {
        id: 2,
        execution_date: new Date(Date.now() - 86400000),
        status: "completed",
        trigger_data: { booking_id: 124, total_amount: 3000 },
        duration: 980,
        actions_executed: 3,
      },
    ];

    res.json({
      success: true,
      data: {
        workflow,
        execution_history,
        metrics: {
          avg_duration: 1115,
          total_executions: workflow.execution_count,
          success_rate: workflow.success_rate,
          last_execution: executionHistory[0]?.execution_date,
        },
      },
    });
  }),
);

/**
 * @swagger
 * /api/workflows:
 *   post:
 *     tags: [Workflows]
 *     summary: Create new workflow
 */
router.post(
  "/",
  [
    authorize(["admin", "manager"]),
    body("name").trim().isLength({ min: 3, max: 100 }),
    body("description").optional().trim(),
    body("type").isIn(["approval", "notification", "automation"]),
    body("triggers").isArray({ min: 1 }),
    body("actions").isArray({ min: 1 }),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        "Validation failed",
        400,
        "VALIDATION_ERROR",
        errors.array(),
      );
    }

    const newWorkflow = {
      id: Math.max(...workflows.map((w) => w.id)) + 1,
      ...req.body,
      status: "draft",
      created_by: req.user.id,
      created_at: new Date(),
      execution_count: 0,
      success_rate: 0,
    };

    workflows.push(newWorkflow);

    await auditLogger.log(
      req.user.id,
      "workflow_created",
      `Workflow created: ${newWorkflow.name}`,
      { workflow_id: newWorkflow.id, type: newWorkflow.type },
    );

    logger.info(`Workflow created: ${newWorkflow.name} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: "Workflow created successfully",
      data: newWorkflow,
    });
  }),
);

/**
 * @swagger
 * /api/workflows/{id}:
 *   put:
 *     tags: [Workflows]
 *     summary: Update workflow
 */
router.put(
  "/:id",
  [
    authorize(["admin", "manager"]),
    param("id").isInt({ min: 1 }).toInt(),
    body("name").optional().trim().isLength({ min: 3, max: 100 }),
    body("description").optional().trim(),
    body("status").optional().isIn(["active", "inactive", "draft"]),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        "Validation failed",
        400,
        "VALIDATION_ERROR",
        errors.array(),
      );
    }

    const { id } = req.params;
    const workflowIndex = workflows.findIndex((w) => w.id === parseInt(id));

    if (workflowIndex === -1) {
      throw new AppError("Workflow not found", 404, "WORKFLOW_NOT_FOUND");
    }

    const updatedWorkflow = {
      ...workflows[workflowIndex],
      ...req.body,
      updated_at: new Date(),
    };

    workflows[workflowIndex] = updatedWorkflow;

    await auditLogger.log(
      req.user.id,
      "workflow_updated",
      `Workflow updated: ${updatedWorkflow.name}`,
      { workflow_id: id, changes: Object.keys(req.body) },
    );

    logger.info(
      `Workflow updated: ${updatedWorkflow.name} by ${req.user.email}`,
    );

    res.json({
      success: true,
      message: "Workflow updated successfully",
      data: updatedWorkflow,
    });
  }),
);

/**
 * @swagger
 * /api/workflows/{id}:
 *   delete:
 *     tags: [Workflows]
 *     summary: Delete workflow
 */
router.delete(
  "/:id",
  [authorize(["admin"]), param("id").isInt({ min: 1 }).toInt()],
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const workflowIndex = workflows.findIndex((w) => w.id === parseInt(id));

    if (workflowIndex === -1) {
      throw new AppError("Workflow not found", 404, "WORKFLOW_NOT_FOUND");
    }

    const workflow = workflows[workflowIndex];
    workflows.splice(workflowIndex, 1);

    await auditLogger.log(
      req.user.id,
      "workflow_deleted",
      `Workflow deleted: ${workflow.name}`,
      { workflow_id: id },
    );

    logger.info(`Workflow deleted: ${workflow.name} by ${req.user.email}`);

    res.json({
      success: true,
      message: "Workflow deleted successfully",
    });
  }),
);

/**
 * @swagger
 * /api/workflows/{id}/execute:
 *   post:
 *     tags: [Workflows]
 *     summary: Execute workflow manually
 */
router.post(
  "/:id/execute",
  [
    authorize(["admin", "manager"]),
    param("id").isInt({ min: 1 }).toInt(),
    body("trigger_data").optional().isObject(),
  ],
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { trigger_data = {} } = req.body;

    const workflow = workflows.find((w) => w.id === parseInt(id));

    if (!workflow) {
      throw new AppError("Workflow not found", 404, "WORKFLOW_NOT_FOUND");
    }

    if (workflow.status !== "active") {
      throw new AppError("Workflow is not active", 400, "WORKFLOW_INACTIVE");
    }

    // Simulate workflow execution
    const execution = {
      id: Date.now(),
      workflow_id: workflow.id,
      executed_by: req.user.id,
      execution_date: new Date(),
      trigger_data,
      status: "running",
      actions_executed: 0,
      total_actions: workflow.actions.length,
    };

    // Mock execution process
    setTimeout(() => {
      execution.status = "completed";
      execution.actions_executed = workflow.actions.length;
      execution.duration = Math.random() * 2000 + 500; // Random duration

      // Update workflow statistics
      workflow.execution_count++;
      workflow.success_rate =
        (workflow.success_rate * (workflow.execution_count - 1) + 100) /
        workflow.execution_count;
    }, 1000);

    await auditLogger.log(
      req.user.id,
      "workflow_executed",
      `Workflow executed manually: ${workflow.name}`,
      { workflow_id: id, trigger_data },
    );

    logger.info(`Workflow executed: ${workflow.name} by ${req.user.email}`);

    res.json({
      success: true,
      message: "Workflow execution started",
      data: execution,
    });
  }),
);

/**
 * @swagger
 * /api/workflows/stats:
 *   get:
 *     tags: [Workflows]
 *     summary: Get workflow statistics
 */
router.get(
  "/stats",
  authorize(["admin", "manager"]),
  asyncHandler(async (req, res) => {
    const stats = {
      total_workflows: workflows.length,
      active_workflows: workflows.filter((w) => w.status === "active").length,
      total_executions: workflows.reduce(
        (sum, w) => sum + w.execution_count,
        0,
      ),
      average_success_rate:
        workflows.reduce((sum, w) => sum + w.success_rate, 0) /
        workflows.length,
      by_type: {
        approval: workflows.filter((w) => w.type === "approval").length,
        notification: workflows.filter((w) => w.type === "notification").length,
        automation: workflows.filter((w) => w.type === "automation").length,
      },
      top_performers: workflows
        .filter((w) => w.execution_count > 0)
        .sort((a, b) => b.success_rate - a.success_rate)
        .slice(0, 5)
        .map((w) => ({
          id: w.id,
          name: w.name,
          success_rate: w.success_rate,
          execution_count: w.execution_count,
        })),
    };

    res.json({
      success: true,
      data: stats,
    });
  }),
);

module.exports = router;
