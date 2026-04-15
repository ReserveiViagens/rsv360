import { crmRepository } from '../db/crm.repository';

export class LoyaltyService {
  async configureProgram(userId: number, config: any) {
    const existing = await crmRepository.getActiveProgram(userId);
    if (existing) return crmRepository.updateProgram(existing.id, config);
    return crmRepository.createProgram({ user_id: userId, ...config });
  }

  async getProgram(userId: number) { return crmRepository.getActiveProgram(userId); }

  async enrollMember(guestProfileId: number, userId: number) {
    const program = await crmRepository.getActiveProgram(userId);
    if (!program) throw new Error('Nenhum programa de fidelidade ativo');
    const existing = await crmRepository.getMemberByGuest(guestProfileId);
    if (existing) throw new Error('Hóspede já inscrito no programa');
    return crmRepository.enrollMember(program.id, guestProfileId);
  }

  async earnPoints(memberId: number, amount: number, bookingId?: number, description?: string) {
    const member = await crmRepository.getMember(memberId);
    if (!member) throw new Error('Membro não encontrado');
    const program = await crmRepository.getProgram(member.program_id);
    const points = Math.floor(amount * Number(program?.points_per_brl || 1));
    const expiresAt = program?.points_expiry_days ? new Date(Date.now() + program.points_expiry_days * 86400000).toISOString() : undefined;
    const transaction = await crmRepository.createTransaction({
      member_id: memberId,
      type: 'earn',
      points,
      balance_after: member.available_points + points,
      description: description || `Pontos por reserva #${bookingId || ''}`.trim(),
      booking_id: bookingId,
      expires_at: expiresAt,
    });
    await crmRepository.updateMember(memberId, {
      available_points: member.available_points + points,
      total_earned_points: member.total_earned_points + points,
      lifetime_points: member.lifetime_points + points,
    });
    await this.checkTierUpgrade(memberId);
    return { transaction, pointsEarned: points };
  }

  async redeemPoints(memberId: number, points: number, description: string) {
    const member = await crmRepository.getMember(memberId);
    if (!member) throw new Error('Membro não encontrado');
    if (member.available_points < points) throw new Error(`Saldo insuficiente: ${member.available_points} disponíveis, ${points} solicitados`);
    const transaction = await crmRepository.createTransaction({
      member_id: memberId,
      type: 'redeem',
      points: -points,
      balance_after: member.available_points - points,
      description,
    });
    await crmRepository.updateMember(memberId, {
      available_points: member.available_points - points,
      total_redeemed_points: member.total_redeemed_points + points,
    });
    return { transaction, remainingPoints: member.available_points - points };
  }

  async checkTierUpgrade(memberId: number) {
    const member = await crmRepository.getMember(memberId);
    if (!member) return null;
    const program = await crmRepository.getProgram(member.program_id);
    if (!program) return null;
    const tiers = Array.isArray(program.tiers) ? program.tiers : [];
    const sorted = [...tiers].sort((left: any, right: any) => right.min_points - left.min_points);
    let newTier = 'Bronze';
    for (const tier of sorted) {
      if (member.lifetime_points >= tier.min_points) {
        newTier = tier.name;
        break;
      }
    }
    if (newTier !== member.tier) {
      await crmRepository.updateMember(memberId, { tier: newTier as any, tier_updated_at: new Date().toISOString() });
      return { oldTier: member.tier, newTier };
    }
    return null;
  }

  async expirePoints() { return crmRepository.expirePoints(); }
  async getStatement(memberId: number, startDate?: string, endDate?: string) { return crmRepository.getStatement(memberId, startDate, endDate); }
  async listMembers(filters: any, page?: number, limit?: number) { return crmRepository.listMembers(filters, page, limit); }

  async grantBonus(memberId: number, points: number, description: string) {
    const member = await crmRepository.getMember(memberId);
    if (!member) throw new Error('Membro não encontrado');
    const transaction = await crmRepository.createTransaction({
      member_id: memberId,
      type: 'bonus',
      points,
      balance_after: member.available_points + points,
      description,
    });
    await crmRepository.updateMember(memberId, {
      available_points: member.available_points + points,
      total_earned_points: member.total_earned_points + points,
      lifetime_points: member.lifetime_points + points,
    });
    await this.checkTierUpgrade(memberId);
    return { transaction, pointsGranted: points };
  }
}

export const loyaltyService = new LoyaltyService();
