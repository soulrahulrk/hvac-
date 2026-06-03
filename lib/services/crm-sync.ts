export interface CRMContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastServiceDate?: string;
  equipmentAge?: number;
  openEstimateAmount?: number;
  tags?: string[];
}

export async function syncHubspotContacts(): Promise<CRMContact[]> {
  const apiKey = process.env.HUBSPOT_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return data.results.map((contact: any) => ({
        id: contact.id,
        name: `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim(),
        email: contact.properties.email || '',
        phone: contact.properties.phone || '',
      }));
    } catch (error) {
      console.error('Failed to sync from HubSpot', error);
    }
  }

  // Mock data if no API key or if fetch failed
  return [
    {
      id: 'mock-1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-0100',
      lastServiceDate: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(), // > 1 year ago
      equipmentAge: 12,
      openEstimateAmount: 0,
      tags: []
    },
    {
      id: 'mock-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '555-0101',
      lastServiceDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
      equipmentAge: 5,
      openEstimateAmount: 1500,
      tags: []
    },
    {
      id: 'mock-3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      phone: '555-0102',
      lastServiceDate: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
      equipmentAge: 15,
      openEstimateAmount: 500,
      tags: []
    }
  ];
}
