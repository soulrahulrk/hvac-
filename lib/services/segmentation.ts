import { CRMContact } from './crm-sync';

export function runSegmentationEngine(customers: CRMContact[]): CRMContact[] {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  return customers.map(customer => {
    const tags = new Set<string>(customer.tags || []);

    if (customer.lastServiceDate) {
      const serviceDate = new Date(customer.lastServiceDate);
      if (serviceDate < oneYearAgo) {
        tags.add('Dormant');
      }
    }

    if (customer.equipmentAge !== undefined && customer.equipmentAge > 10) {
      tags.add('Replacement Candidate');
    }

    if (customer.openEstimateAmount !== undefined && customer.openEstimateAmount > 0) {
      tags.add('Follow-up Needed');
    }

    return {
      ...customer,
      tags: Array.from(tags)
    };
  });
}
