'use client';

import { useState } from 'react';
import './contacts.css';

/* ─── Types ────────────────────────────────────────── */
type LeadStatus = 'Active' | 'Dormant' | 'Churned' | 'New' | 'Contacted' | 'Qualified';
type EquipmentType = 'AC' | 'Furnace' | 'Heat Pump' | 'Boiler';
type MembershipStatus = 'Active' | 'Lapsed' | 'Expired' | 'None';

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

/* ─── Hardcoded Data ───────────────────────────────── */
const contacts: Contact[] = [
  { id: 1, name: 'James Morrison', phone: '(512) 555-0134', email: 'jmorrison@email.com', equipment: 'AC', equipmentAge: 14, leadStatus: 'Dormant', estimate: 8750, membership: 'Lapsed', lastContact: 'Mar 12, 2026' },
  { id: 2, name: 'Sarah Chen', phone: '(512) 555-0278', email: 'schen@email.com', equipment: 'Heat Pump', equipmentAge: 3, leadStatus: 'Active', estimate: 12400, membership: 'Active', lastContact: 'May 28, 2026' },
  { id: 3, name: 'Robert Williams', phone: '(512) 555-0391', email: 'rwilliams@email.com', equipment: 'Furnace', equipmentAge: 18, leadStatus: 'Churned', estimate: 6200, membership: 'Expired', lastContact: 'Jan 05, 2026' },
  { id: 4, name: 'Maria Garcia', phone: '(512) 555-0445', email: 'mgarcia@email.com', equipment: 'AC', equipmentAge: 7, leadStatus: 'Qualified', estimate: 15300, membership: 'Active', lastContact: 'May 25, 2026' },
  { id: 5, name: 'David Thompson', phone: '(512) 555-0517', email: 'dthompson@email.com', equipment: 'Boiler', equipmentAge: 22, leadStatus: 'Dormant', estimate: 9800, membership: 'None', lastContact: 'Feb 18, 2026' },
  { id: 6, name: 'Emily Rodriguez', phone: '(512) 555-0623', email: 'erodriguez@email.com', equipment: 'Heat Pump', equipmentAge: 5, leadStatus: 'New', estimate: 11200, membership: 'None', lastContact: 'May 30, 2026' },
  { id: 7, name: 'Michael Park', phone: '(512) 555-0748', email: 'mpark@email.com', equipment: 'AC', equipmentAge: 12, leadStatus: 'Active', estimate: 7600, membership: 'Active', lastContact: 'May 22, 2026' },
  { id: 8, name: 'Jennifer Adams', phone: '(512) 555-0852', email: 'jadams@email.com', equipment: 'Furnace', equipmentAge: 9, leadStatus: 'Contacted', estimate: 4500, membership: 'Lapsed', lastContact: 'Apr 14, 2026' },
  { id: 9, name: 'Daniel Kim', phone: '(512) 555-0963', email: 'dkim@email.com', equipment: 'AC', equipmentAge: 16, leadStatus: 'Dormant', estimate: 13100, membership: 'Expired', lastContact: 'Dec 08, 2025' },
  { id: 10, name: 'Lisa Patel', phone: '(512) 555-1074', email: 'lpatel@email.com', equipment: 'Heat Pump', equipmentAge: 2, leadStatus: 'New', estimate: 9400, membership: 'None', lastContact: 'May 29, 2026' },
  { id: 11, name: 'Chris Nguyen', phone: '(512) 555-1185', email: 'cnguyen@email.com', equipment: 'Boiler', equipmentAge: 11, leadStatus: 'Active', estimate: 18500, membership: 'Active', lastContact: 'May 27, 2026' },
  { id: 12, name: 'Amanda Foster', phone: '(512) 555-1296', email: 'afoster@email.com', equipment: 'Furnace', equipmentAge: 20, leadStatus: 'Churned', estimate: 5800, membership: 'Expired', lastContact: 'Nov 15, 2025' },
  { id: 13, name: 'Steven Wright', phone: '(512) 555-1307', email: 'swright@email.com', equipment: 'AC', equipmentAge: 6, leadStatus: 'Qualified', estimate: 10700, membership: 'Active', lastContact: 'May 20, 2026' },
  { id: 14, name: 'Rachel Turner', phone: '(512) 555-1418', email: 'rturner@email.com', equipment: 'Heat Pump', equipmentAge: 8, leadStatus: 'Contacted', estimate: 14200, membership: 'Lapsed', lastContact: 'Apr 30, 2026' },
  { id: 15, name: 'Kevin O\'Brien', phone: '(512) 555-1529', email: 'kobrien@email.com', equipment: 'Boiler', equipmentAge: 15, leadStatus: 'Dormant', estimate: 7300, membership: 'None', lastContact: 'Mar 04, 2026' },
];

/* ─── Helpers ──────────────────────────────────────── */

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase();
}

function getStatusBadgeClass(status: LeadStatus): string {
  switch (status) {
    case 'Active':    return 'badge-green';
    case 'Dormant':   return 'badge-yellow';
    case 'Churned':   return 'badge-red';
    case 'New':       return 'badge-blue';
    case 'Qualified': return 'badge-purple';
    case 'Contacted': return 'badge-cyan';
    default:          return '';
  }
}

function getMembershipLabel(membership: MembershipStatus) {
  return membership;
}

function formatCurrency(n: number) {
  return '$' + n.toLocaleString();
}

/* ─── Component ────────────────────────────────────── */

export default function ContactsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [equipmentFilter, setEquipmentFilter] = useState('All');
  const [membershipFilter, setMembershipFilter] = useState('All');

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
          <p>1,247 contacts · Last synced 2 hours ago</p>
        </div>
        <div className="page-header-right">
          <button className="btn-primary">
            <span className="btn-icon">📄</span> Upload CSV
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
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Dormant">Dormant</option>
            <option value="Active">Active</option>
            <option value="Churned">Churned</option>
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
            <option value="Active">Active</option>
            <option value="Lapsed">Lapsed</option>
            <option value="Expired">Expired</option>
            <option value="None">None</option>
          </select>

          {hasFilters && (
            <button className="btn-ghost btn-sm" onClick={clearFilters}>
              ✕ Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Stats Badges ───────────────────────── */}
      <div className="contacts-stats">
        <span className="badge badge-green">● Active: 312</span>
        <span className="badge badge-yellow">● Dormant: 445</span>
        <span className="badge badge-red">● Churned: 187</span>
        <span className="badge badge-blue">● New Leads: 203</span>
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
              {filtered.map((contact) => (
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
                    <span className="membership-label">{getMembershipLabel(contact.membership)}</span>
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
              {filtered.length === 0 && (
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
            Showing 1–{filtered.length} of 1,247
          </span>
          <div className="pagination-buttons">
            <button className="btn-secondary btn-sm" disabled>Previous</button>
            <button className="btn-secondary btn-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
