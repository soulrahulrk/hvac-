'use client';

import { useState, useEffect } from 'react';
import './contacts.css';

/* ─── Types ────────────────────────────────────────── */
type LeadStatus = 'Active' | 'Dormant' | 'Churned' | 'New' | 'Contacted' | 'Qualified' | string;
type EquipmentType = 'AC' | 'Furnace' | 'Heat Pump' | 'Boiler' | string;
type MembershipStatus = 'Active' | 'Lapsed' | 'Expired' | 'None' | string;

interface Contact {
  id: number;
  name: string;
  phone: string;
  email: string;
  equipment: EquipmentType;
  equipmentAge: number;
  leadStatus: LeadStatus;
  estimate: number;
  membership: MembershipStatus;
  lastContact: string;
}

/* ─── Helpers ──────────────────────────────────────── */

function getInitials(name: string) {
  if (!name) return '??';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);
}

function getStatusBadgeClass(status: LeadStatus): string {
  switch (status.toUpperCase()) {
    case 'ACTIVE':    return 'badge-green';
    case 'DORMANT':   return 'badge-yellow';
    case 'CHURNED':   return 'badge-red';
    case 'NEW':       return 'badge-blue';
    case 'QUALIFIED': return 'badge-purple';
    case 'CONTACTED': return 'badge-cyan';
    default:          return '';
  }
}

function formatCurrency(n: number) {
  return '$' + (n || 0).toLocaleString();
}

/* ─── Component ────────────────────────────────────── */

export default function ContactsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [equipmentFilter, setEquipmentFilter] = useState('All');
  const [membershipFilter, setMembershipFilter] = useState('All');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/contacts');
      const data = await res.json();
      
      const mapped: Contact[] = data.map((d: any) => ({
        id: d.id,
        name: `${d.firstName} ${d.lastName}`.trim(),
        phone: d.phone || 'N/A',
        email: d.email,
        equipment: d.equipmentType || 'Unknown',
        equipmentAge: d.equipmentAge || 0,
        leadStatus: d.leadStatus,
        estimate: d.estimateAmount || 0,
        membership: d.membershipStatus,
        lastContact: new Date(d.updatedAt).toLocaleDateString(),
      }));
      setContacts(mapped);
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncHubspot = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/hubspot/sync');
      const data = await res.json();
      if (data.success) {
        alert(`Successfully synced ${data.syncedCount} contacts from Hubspot.`);
        fetchContacts();
      } else {
        alert(`Failed to sync: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error syncing with Hubspot');
    } finally {
      setIsSyncing(false);
    }
  };

  const hasFilters =
    search !== '' ||
    statusFilter !== 'All' ||
    equipmentFilter !== 'All' ||
    membershipFilter !== 'All';

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setEquipmentFilter('All');
    setMembershipFilter('All');
  };

  /* Filtering logic */
  const filtered = contacts.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      const matchesSearch =
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q);
      if (!matchesSearch) return false;
    }
    if (statusFilter !== 'All' && c.leadStatus !== statusFilter) return false;
    if (equipmentFilter !== 'All' && c.equipment !== equipmentFilter) return false;
    if (membershipFilter !== 'All' && c.membership !== membershipFilter) return false;
    return true;
  });

  return (
    <div className="contacts-page">
      {/* ── Page Header ────────────────────────── */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Customer Database</h1>
          <p>{contacts.length} contacts · Data populated dynamically</p>
        </div>
        <div className="page-header-right">
          <button className="btn-primary" onClick={handleSyncHubspot} disabled={isSyncing}>
            <span className="btn-icon">🔄</span> {isSyncing ? 'Syncing...' : 'Sync Hubspot'}
          </button>
          <button className="btn-secondary">
            <span className="btn-icon">＋</span> Add Contact
          </button>
        </div>
      </div>

      {/* ── Filter Bar ─────────────────────────── */}
      <div className="glass-card contacts-filters">
        <div className="filters-row">
          <div className="filter-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="input search-input"
              placeholder="Search by name, email, phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="DORMANT">Dormant</option>
            <option value="ACTIVE">Active</option>
            <option value="CHURNED">Churned</option>
          </select>

          <select
            className="select"
            value={equipmentFilter}
            onChange={(e) => setEquipmentFilter(e.target.value)}
          >
            <option value="All">All Equipment</option>
            <option value="AC">AC</option>
            <option value="Furnace">Furnace</option>
            <option value="Heat Pump">Heat Pump</option>
            <option value="Boiler">Boiler</option>
          </select>

          <select
            className="select"
            value={membershipFilter}
            onChange={(e) => setMembershipFilter(e.target.value)}
          >
            <option value="All">All Memberships</option>
            <option value="ACTIVE">Active</option>
            <option value="LAPSED">Lapsed</option>
            <option value="EXPIRED">Expired</option>
            <option value="NONE">None</option>
          </select>

          {hasFilters && (
            <button className="btn-ghost btn-sm" onClick={clearFilters}>
              ✕ Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Contacts Table ─────────────────────── */}
      <div className="glass-card contacts-table-card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name <span className="sort-icon">↕</span></th>
                <th>Phone <span className="sort-icon">↕</span></th>
                <th>Equipment <span className="sort-icon">↕</span></th>
                <th>Age <span className="sort-icon">↕</span></th>
                <th>Lead Status <span className="sort-icon">↕</span></th>
                <th>Estimate <span className="sort-icon">↕</span></th>
                <th>Membership <span className="sort-icon">↕</span></th>
                <th>Last Contact <span className="sort-icon">↕</span></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={9} style={{textAlign: 'center', padding: '2rem'}}>Loading...</td>
                </tr>
              )}
              {!isLoading && filtered.map((contact) => (
                <tr key={contact.id}>
                  {/* Name + Avatar */}
                  <td>
                    <div className="contact-name-cell">
                      <div className="contact-avatar">{getInitials(contact.name)}</div>
                      <div className="contact-name-info">
                        <span className="contact-name">{contact.name}</span>
                        <span className="contact-email">{contact.email}</span>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td>{contact.phone}</td>

                  {/* Equipment */}
                  <td>{contact.equipment}</td>

                  {/* Age */}
                  <td>
                    <span className={contact.equipmentAge > 10 ? 'age-warning' : ''}>
                      {contact.equipmentAge} yrs
                    </span>
                  </td>

                  {/* Lead Status */}
                  <td>
                    <span className={`badge ${getStatusBadgeClass(contact.leadStatus)}`}>
                      {contact.leadStatus}
                    </span>
                  </td>

                  {/* Estimate */}
                  <td className="cell-estimate">{formatCurrency(contact.estimate)}</td>

                  {/* Membership */}
                  <td>
                    <span className="membership-label">{contact.membership}</span>
                  </td>

                  {/* Last Contact */}
                  <td className="cell-date">{contact.lastContact}</td>

                  {/* Actions */}
                  <td>
                    <div className="actions-cell">
                      <button className="btn-secondary btn-sm">View</button>
                      <button className="btn-primary btn-sm">Message</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="empty-state">
                    No contacts match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ────────────────────────── */}
        <div className="pagination">
          <span className="pagination-info">
            Showing {filtered.length} of {contacts.length}
          </span>
          <div className="pagination-buttons">
            <button className="btn-secondary btn-sm" disabled>Previous</button>
            <button className="btn-secondary btn-sm" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
