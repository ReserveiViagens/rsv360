import { test, expect } from '@playwright/test';

test.describe('RSV 360° Ecosystem - User Journey Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para a página inicial
    await page.goto('/');
  });

  test('Complete customer journey - from website visit to booking', async ({ page }) => {
    // 1. Visit public website
    await test.step('Visit public website', async () => {
      await page.goto('/');
      await expect(page).toHaveTitle(/RSV 360°/);
      
      // Verify main navigation
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('text=Home')).toBeVisible();
      await expect(page.locator('text=Services')).toBeVisible();
      await expect(page.locator('text=Contact')).toBeVisible();
    });

    // 2. Browse services
    await test.step('Browse services', async () => {
      await page.click('text=Services');
      await expect(page).toHaveURL(/.*services/);
      
      // Verify services are displayed
      await expect(page.locator('[data-testid="service-card"]')).toHaveCount.greaterThan(0);
    });

    // 3. View product catalog
    await test.step('View product catalog', async () => {
      await page.click('text=Products');
      await expect(page).toHaveURL(/.*products/);
      
      // Verify products are displayed
      await expect(page.locator('[data-testid="product-item"]')).toHaveCount.greaterThan(0);
    });

    // 4. Contact form submission
    await test.step('Submit contact form', async () => {
      await page.click('text=Contact');
      await expect(page).toHaveURL(/.*contact/);
      
      // Fill contact form
      await page.fill('[data-testid="contact-name"]', 'Test Customer');
      await page.fill('[data-testid="contact-email"]', 'test@example.com');
      await page.fill('[data-testid="contact-phone"]', '+1234567890');
      await page.fill('[data-testid="contact-message"]', 'I am interested in your services');
      
      // Submit form
      await page.click('[data-testid="contact-submit"]');
      
      // Verify success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });

    // 5. Login to customer portal
    await test.step('Login to customer portal', async () => {
      await page.click('text=Login');
      await expect(page).toHaveURL(/.*login/);
      
      // Fill login form
      await page.fill('[data-testid="login-email"]', 'test@example.com');
      await page.fill('[data-testid="login-password"]', 'password123');
      
      // Submit login
      await page.click('[data-testid="login-submit"]');
      
      // Verify successful login
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    // 6. Make a booking
    await test.step('Make a booking', async () => {
      await page.click('text=Book Now');
      await expect(page).toHaveURL(/.*booking/);
      
      // Select hotel
      await page.click('[data-testid="hotel-select"]');
      await page.click('[data-testid="hotel-option-1"]');
      
      // Select dates
      await page.fill('[data-testid="checkin-date"]', '2024-02-01');
      await page.fill('[data-testid="checkout-date"]', '2024-02-03');
      
      // Select number of guests
      await page.selectOption('[data-testid="guests-select"]', '2');
      
      // Proceed to payment
      await page.click('[data-testid="proceed-payment"]');
      
      // Fill payment details
      await page.fill('[data-testid="card-number"]', '4111111111111111');
      await page.fill('[data-testid="card-expiry"]', '12/25');
      await page.fill('[data-testid="card-cvv"]', '123');
      await page.fill('[data-testid="card-name"]', 'Test Customer');
      
      // Complete booking
      await page.click('[data-testid="complete-booking"]');
      
      // Verify booking confirmation
      await expect(page.locator('[data-testid="booking-confirmation"]')).toBeVisible();
      await expect(page.locator('[data-testid="booking-number"]')).toBeVisible();
    });
  });

  test('Admin dashboard workflow', async ({ page }) => {
    // Login as admin
    await test.step('Login as admin', async () => {
      await page.goto('/admin/login');
      
      await page.fill('[data-testid="admin-email"]', 'admin@rsv360.com');
      await page.fill('[data-testid="admin-password"]', 'admin123');
      
      await page.click('[data-testid="admin-login"]');
      await expect(page).toHaveURL(/.*admin\/dashboard/);
    });

    // View dashboard overview
    await test.step('View dashboard overview', async () => {
      await expect(page.locator('[data-testid="dashboard-stats"]')).toBeVisible();
      await expect(page.locator('[data-testid="recent-bookings"]')).toBeVisible();
      await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
    });

    // Manage users
    await test.step('Manage users', async () => {
      await page.click('text=Users');
      await expect(page).toHaveURL(/.*admin\/users/);
      
      // Verify users table
      await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
      
      // Create new user
      await page.click('[data-testid="create-user"]');
      await page.fill('[data-testid="user-name"]', 'New Test User');
      await page.fill('[data-testid="user-email"]', 'newuser@example.com');
      await page.selectOption('[data-testid="user-role"]', 'customer');
      
      await page.click('[data-testid="save-user"]');
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });

    // View analytics
    await test.step('View analytics', async () => {
      await page.click('text=Analytics');
      await expect(page).toHaveURL(/.*admin\/analytics/);
      
      // Verify analytics dashboard
      await expect(page.locator('[data-testid="analytics-dashboard"]')).toBeVisible();
      await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="booking-trends"]')).toBeVisible();
    });

    // Manage inventory
    await test.step('Manage inventory', async () => {
      await page.click('text=Inventory');
      await expect(page).toHaveURL(/.*admin\/inventory/);
      
      // Verify inventory table
      await expect(page.locator('[data-testid="inventory-table"]')).toBeVisible();
      
      // Update stock
      await page.click('[data-testid="update-stock-1"]');
      await page.fill('[data-testid="new-quantity"]', '50');
      await page.click('[data-testid="save-stock"]');
      
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });
  });

  test('Mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await test.step('Verify mobile navigation', async () => {
      await page.goto('/');
      
      // Verify mobile menu button
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
      
      // Open mobile menu
      await page.click('[data-testid="mobile-menu-button"]');
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      
      // Verify menu items
      await expect(page.locator('[data-testid="mobile-menu"] a[href="/"]')).toBeVisible();
      await expect(page.locator('[data-testid="mobile-menu"] a[href="/services"]')).toBeVisible();
      await expect(page.locator('[data-testid="mobile-menu"] a[href="/contact"]')).toBeVisible();
    });

    await test.step('Verify mobile forms', async () => {
      await page.goto('/contact');
      
      // Verify form is mobile-friendly
      await expect(page.locator('[data-testid="contact-form"]')).toBeVisible();
      
      // Test form interaction on mobile
      await page.fill('[data-testid="contact-name"]', 'Mobile Test User');
      await page.fill('[data-testid="contact-email"]', 'mobile@example.com');
      
      // Verify keyboard doesn't cover form fields
      await page.click('[data-testid="contact-message"]');
      await expect(page.locator('[data-testid="contact-message"]')).toBeInViewport();
    });
  });

  test('Performance and accessibility', async ({ page }) => {
    await test.step('Check page performance', async () => {
      await page.goto('/');
      
      // Wait for page to load completely
      await page.waitForLoadState('networkidle');
      
      // Check for performance issues
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
        };
      });
      
      expect(performanceMetrics.loadTime).toBeLessThan(3000); // Less than 3 seconds
      expect(performanceMetrics.domContentLoaded).toBeLessThan(1000); // Less than 1 second
    });

    await test.step('Check accessibility', async () => {
      await page.goto('/');
      
      // Check for basic accessibility features
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('nav')).toHaveAttribute('role', 'navigation');
      
      // Check for alt text on images
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy();
      }
      
      // Check for proper heading hierarchy
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      expect(headingCount).toBeGreaterThan(0);
    });
  });
});
