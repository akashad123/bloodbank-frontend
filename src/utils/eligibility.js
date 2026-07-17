import { ELIGIBILITY_GAP_DAYS } from './constants';

/**
 * Centralized donor eligibility calculation
 * @param {Object} user - The user object
 * @returns {Object} Structured eligibility status
 */
export const calculateEligibility = (user) => {
  if (!user || !user.isQualifiedDonor) {
    return {
      status: user?.donorStatus || 'Pending Pre-screening',
      isEligible: false,
      badgeText: 'Not Eligible to Donate Yet',
      daysRemaining: 0,
      nextEligibleDate: null,
    };
  }

  if (!user.lastDonationDate) {
    return {
      status: 'Eligible to Donate',
      isEligible: true,
      badgeText: 'Eligible to Donate',
      daysRemaining: 0,
      nextEligibleDate: null,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastDonation = new Date(user.lastDonationDate);
  lastDonation.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - lastDonation.getTime();
  const daysSinceDonation = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysRemaining = ELIGIBILITY_GAP_DAYS - daysSinceDonation;

  if (daysRemaining > 0) {
    const nextDate = new Date(lastDonation);
    nextDate.setDate(lastDonation.getDate() + ELIGIBILITY_GAP_DAYS);
    
    return {
      status: 'Waiting Period Active',
      isEligible: false,
      badgeText: 'Not Eligible to Donate Yet',
      daysRemaining: daysRemaining,
      nextEligibleDate: nextDate.toLocaleDateString('en-GB').replace(/\//g, '-'), // DD-MM-YYYY
    };
  }

  return {
    status: 'Eligible to Donate',
    isEligible: true,
    badgeText: 'Eligible to Donate',
    daysRemaining: 0,
    nextEligibleDate: null,
  };
};
