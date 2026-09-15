// Typesafe API Client for ZManage Operations
// Connects ZManage-Web to ZManage-APIs (Port 4003)

import { normalizeApiUrl } from './urls';

export const API_BASE_URL = normalizeApiUrl(import.meta.env.VITE_API_URL, 4003, '/api/v1');

export interface AssetRecord {
  id: string;
  client_id: string;
  project_id: string;
  location_id?: string | null;
  location_name?: string | null;
  name: string;
  code: string;
  category: string;
  serial_number: string;
  condition: 'excellent' | 'good' | 'fair' | 'in_repair';
  status: 'available' | 'on_shoot' | 'in_use' | 'maintenance' | 'in_repair';
  purchase_date?: string;
  purchase_cost?: number;
  currency?: string;
  image_url?: string;
  specs?: Record<string, any>;
  maintenance_notes?: string;
  is_maintenance_applicable?: boolean;
  maintenance_interval_days?: number;
  last_serviced_at?: string | null;
  next_service_due?: string | null;
  is_depreciation_applicable?: boolean;
  salvage_value?: number;
  useful_life_months?: number;
  book_value?: number;
  created_at?: string;
  updated_at?: string;
}

export interface VaultRecord {
  id: string;
  client_id: string;
  project_id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  asset_count?: number;
  kit_count?: number;
  consumable_count?: number;
  total_items?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ConsumableRecord {
  id: string;
  client_id: string;
  project_id: string;
  location_id?: string | null;
  location_name?: string | null;
  name: string;
  category: string;
  stock_quantity: number;
  unit: string;
  min_reorder_level: number;
  unit_cost: number;
  currency: string;
  is_low_stock?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface KitItemRecord {
  id?: string;
  kit_id?: string;
  item_type: 'asset_category' | 'specific_asset' | 'consumable';
  category_or_name: string;
  specific_asset_id?: string | null;
  consumable_id?: string | null;
  quantity_required: number;
  assets?: { id: string; name: string; code: string; condition: string; status: string } | null;
  consumables?: { id: string; name: string; stock_quantity: number; unit: string } | null;
}

export interface AssetKitRecord {
  id: string;
  client_id: string;
  project_id: string;
  location_id?: string | null;
  location_name?: string | null;
  name: string;
  code: string;
  category: string;
  total_kits_count: number;
  description?: string | null;
  is_active: boolean;
  items: KitItemRecord[];
  created_at?: string;
  updated_at?: string;
}

export interface AssetHistoryRecord {
  id: string;
  status: string;
  lock_start: string;
  lock_end: string;
  checked_out_at?: string | null;
  checked_in_at?: string | null;
  return_condition?: string | null;
  created_at: string;
  allocations?: {
    id: string;
    title?: string;
    venue?: string;
    client_name?: string;
    client_phone?: string;
    start_time: string;
    end_time: string;
    status: string;
  } | null;
}

export interface AssetNoteRecord {
  id: string;
  note: string;
  condition?: 'excellent' | 'good' | 'fair' | 'in_repair' | string;
  action?: 'return_inspection' | 'maintenance' | 'manual_note' | string;
  created_at: string;
  author_name?: string;
}

export interface VerifyAccessResult {
  success: boolean;
  hasAccess: boolean;
  rmsEnabled: boolean;
  projectId?: string;
  projectName?: string;
  roleTier?: string;
  allowedTabs?: string[];
  availableProjects?: ProjectRecord[];
  error?: string;
}

export interface WorkerRecord {
  id: string;
  client_id: string;
  project_id: string;
  user_id?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  primary_role: string;
  role_tier?: 'admin' | 'manager' | 'logistics' | 'finance' | 'crew' | 'custom' | string;
  allowed_tabs?: string[];
  skills?: string[];
  worker_type: 'in_house' | 'freelance' | 'contractor';
  day_rate: number;
  half_day_rate?: number;
  overtime_hourly_rate?: number;
  currency?: string;
  payment_details?: {
    upi_id?: string;
    bank_account?: string;
    ifsc?: string;
  };
  status: 'active' | 'on_leave';
  created_at?: string;
}

export interface AllocationRecord {
  id: string;
  client_id: string;
  project_id: string;
  title?: string;
  shoot_title?: string;
  venue?: string;
  shoot_venue?: string;
  shoot_date?: string;
  client_name?: string;
  client_phone?: string;
  start_time: string;
  end_time: string;
  asset_ids: string[];
  worker_ids: string[];
  status: 'draft' | 'confirmed' | 'active' | 'completed' | 'cancelled' | string;
  notes?: string;
  created_at?: string;
  assets?: AssetRecord[];
  workers?: WorkerRecord[];
  asset_locks?: any[];
  worker_shifts?: any[];
}

export interface PayoutRecord {
  id: string;
  client_id: string;
  project_id: string;
  worker_id: string;
  shift_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'settled' | 'failed';
  utr_reference?: string;
  settled_at?: string;
  created_at?: string;
  workers?: {
    name: string;
    phone: string;
    payment_details?: {
      upi_id?: string;
    };
  };
}

export interface ImportCandidate {
  user_id: string;
  name: string;
  phone: string;
  email?: string;
  auth_role?: string;
  is_already_worker: boolean;
}

export interface BookingCandidate {
  booking_id: string;
  order_id: string;
  package_name: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  amount: number;
  status: string;
  is_offline?: boolean;
  is_already_synced: boolean;
  selected?: boolean;
}

export interface PayoutsSummary {
  pending_total: number;
  settled_total: number;
  paid_total?: number;
  pending_count: number;
  settled_count: number;
}

export interface ProjectRecord {
  id: string;
  name: string;
  category?: string;
  websiteType?: string;
  isPrimary?: boolean;
}

export interface AuditLogRecord {
  id: string;
  admin_id: string;
  client_id: string;
  action: string;
  entity: string;
  metadata: Record<string, any>;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

export interface AuditLogMetrics {
  totalEvents: number;
  gearOperations: number;
  timelineDispatches: number;
  payoutSettlements: number;
  crewOperations: number;
}

export interface AuditLogsResponse {
  success: boolean;
  total: number;
  limit: number;
  offset: number;
  metrics: AuditLogMetrics;
  logs: AuditLogRecord[];
}

export interface AnalyticsOverview {
  total_assets: number;
  available_assets: number;
  in_use_assets: number;
  maintenance_assets: number;
  utilization_rate: number;
  total_workers: number;
  active_workers: number;
  total_allocations: number;
  upcoming_allocations: number;
  pending_payouts: number;
  paid_payouts: number;
  currency: string;
  category_breakdown: Record<string, number>;
}

class ApiClient {
  private getHeaders(): HeadersInit {
    const sessionStr = localStorage.getItem('zmanage_session') || localStorage.getItem('zresource_session');
    let tenantId = '';
    let token = '';

    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        // Priority: use current active projectId if present, otherwise tenantId
        if (session.projectId) tenantId = session.projectId;
        else if (session.tenantId) tenantId = session.tenantId;
        if (session.token) token = session.token;
      } catch {
        // use defaults
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (tenantId) {
      headers['X-Tenant-ID'] = tenantId;
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {})
      }
    });

    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        console.warn('[ZManage API] Session token rejected or expired (401).');
      }
      throw new Error(data?.error || `Request failed with status ${res.status}`);
    }
    return data;
  }

  // Workspaces & Projects
  async getClientProjects(): Promise<ProjectRecord[]> {
    try {
      const res = await this.request<{ success: boolean; projects: ProjectRecord[] }>('/auth/projects');
      return res.projects || [];
    } catch {
      return [];
    }
  }

  // Access & Security Verification
  async verifyAccess(projectId?: string): Promise<VerifyAccessResult> {
    try {
      const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
      return await this.request<VerifyAccessResult>(`/auth/verify-access${query}`);
    } catch (err: any) {
      return {
        success: false,
        hasAccess: false,
        rmsEnabled: false,
        error: err?.message || 'Access verification failed'
      };
    }
  }

  // Analytics
  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    const res = await this.request<{ success: boolean; analytics: AnalyticsOverview }>('/analytics/overview');
    return res.analytics;
  }

  // Assets & Products
  async getAssets(params?: { category?: string; status?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await this.request<{ success: boolean; count: number; assets: AssetRecord[] }>(`/assets${qs}`);
    return res.assets;
  }

  async createAsset(asset: Partial<AssetRecord>) {
    const res = await this.request<{ success: boolean; asset: AssetRecord }>('/assets', {
      method: 'POST',
      body: JSON.stringify(asset)
    });
    return res.asset;
  }

  async updateAsset(id: string, updates: Partial<AssetRecord>) {
    const res = await this.request<{ success: boolean; asset: AssetRecord }>(`/assets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    return res.asset;
  }

  async deleteAsset(id: string) {
    return await this.request<{ success: boolean; message: string }>(`/assets/${id}`, {
      method: 'DELETE'
    });
  }

  async getAssetHistory(id: string) {
    return await this.request<{
      success: boolean;
      asset: AssetRecord;
      history: AssetHistoryRecord[];
      notes_history?: AssetNoteRecord[];
    }>(`/assets/${id}/history`);
  }

  async addAssetNote(id: string, data: { note: string; condition?: string; action?: string }) {
    return await this.request<{
      success: boolean;
      asset: AssetRecord;
      entry: AssetNoteRecord;
      notes_history: AssetNoteRecord[];
    }>(`/assets/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Workers & Team
  async getWorkers(params?: { role?: string; worker_type?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.role) query.append('role', params.role);
    if (params?.worker_type) query.append('worker_type', params.worker_type);
    if (params?.search) query.append('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await this.request<{ success: boolean; count: number; workers: WorkerRecord[] }>(`/workers${qs}`);
    return res.workers;
  }

  async createWorker(worker: Partial<WorkerRecord>) {
    const res = await this.request<{ success: boolean; worker: WorkerRecord }>('/workers', {
      method: 'POST',
      body: JSON.stringify(worker)
    });
    return res.worker;
  }

  async updateWorker(id: string, updates: Partial<WorkerRecord>) {
    const res = await this.request<{ success: boolean; worker: WorkerRecord }>(`/workers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    return res.worker;
  }

  async updateWorkerPermissions(id: string, payload: { role_tier?: string; allowed_tabs: string[] }) {
    return await this.request<{ success: boolean; message: string; worker: WorkerRecord }>(`/workers/${id}/permissions`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  }

  async deleteWorker(id: string) {
    return await this.request<{ success: boolean; message: string }>(`/workers/${id}`, {
      method: 'DELETE'
    });
  }

  async getImportCandidates() {
    return await this.request<{
      success: boolean;
      total_candidates: number;
      already_onboarded: number;
      candidates: ImportCandidate[];
    }>('/workers/import/candidates');
  }

  async batchImportWorkers(payload: {
    selected_users: Array<{
      user_id?: string;
      name: string;
      phone: string;
      email?: string;
      primary_role: string;
      day_rate?: number;
      worker_type?: 'in_house' | 'freelance' | 'contractor';
    }>;
    default_worker_type?: 'in_house' | 'freelance' | 'contractor';
    default_day_rate?: number;
  }) {
    return await this.request<{
      success: boolean;
      imported_count: number;
      workers: WorkerRecord[];
    }>('/workers/import/batch', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Allocations & Shoot Scheduling
  async getAllocations() {
    const res = await this.request<{ success: boolean; count: number; allocations: AllocationRecord[] }>('/allocations');
    return res.allocations;
  }

  async createAllocation(allocation: {
    shoot_title: string;
    shoot_venue?: string;
    shoot_date?: string;
    client_name?: string;
    client_phone?: string;
    start_time: string;
    end_time: string;
    asset_ids: string[];
    worker_ids?: string[];
    notes?: string;
    crew?: Array<{
      worker_id: string;
      assigned_role: string;
      call_time?: string;
      wrap_time?: string;
      agreed_pay?: number;
    }>;
  }) {
    const res = await this.request<{ success: boolean; allocation: AllocationRecord }>('/allocations', {
      method: 'POST',
      body: JSON.stringify(allocation)
    });
    return res.allocation;
  }

  async deleteAllocation(id: string) {
    return await this.request<{ success: boolean }>(`/allocations/${id}`, {
      method: 'DELETE'
    });
  }

  async getBookingCandidates() {
    return await this.request<{
      success: boolean;
      total_candidates: number;
      already_synced: number;
      candidates: BookingCandidate[];
    }>('/allocations/sync-candidates');
  }

  async batchSyncBookings(payload: {
    selected_bookings: Array<{
      booking_id: string;
      title: string;
      client_name?: string;
      client_phone?: string;
      venue?: string;
      start_time: string;
      end_time: string;
      notes?: string;
    }>;
  }) {
    return await this.request<{
      success: boolean;
      synced_count: number;
      allocations: AllocationRecord[];
    }>('/allocations/batch-sync', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async createOfflineBooking(payload: {
    client_name: string;
    client_phone?: string;
    client_email?: string;
    package_name: string;
    event_date: string;
    event_time?: string;
    venue?: string;
    amount?: number | string;
    payment_status?: string;
    notes?: string;
  }) {
    return await this.request<{
      success: boolean;
      message: string;
      booking: any;
    }>('/allocations/offline-booking', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Payouts & Compensation
  async getPayouts(params?: { status?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await this.request<{ success: boolean; count: number; payouts: PayoutRecord[] }>(`/payouts${qs}`);
    return res.payouts;
  }

  async getPayoutsSummary() {
    const res = await this.request<{ success: boolean; summary: PayoutsSummary }>('/payouts/summary');
    return res.summary;
  }

  async createPayout(payout: {
    worker_id: string;
    allocation_id?: string;
    base_amount?: number;
    overtime_amount?: number;
    bonus_or_deduction?: number;
    total_amount: number;
    currency?: string;
    payout_status?: 'pending' | 'approved' | 'paid';
    payment_mode?: 'upi' | 'bank_transfer' | 'cash' | 'gateway';
    reference_number?: string;
    notes?: string;
  }) {
    const res = await this.request<{ success: boolean; payout: PayoutRecord }>('/payouts', {
      method: 'POST',
      body: JSON.stringify(payout)
    });
    return res.payout;
  }

  async settlePayout(id: string, utr_reference: string, payment_mode: string = 'upi') {
    const res = await this.request<{ success: boolean; payout: PayoutRecord }>(`/payouts/${id}/settle`, {
      method: 'POST',
      body: JSON.stringify({ reference_number: utr_reference, payment_mode })
    });
    return res.payout;
  }

  // Security & Audit Logs
  async getAuditLogs(params?: {
    entity?: string;
    action?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.entity && params.entity !== 'all') query.append('entity', params.entity);
    if (params?.action && params.action !== 'all') query.append('action', params.action);
    if (params?.search) query.append('search', params.search);
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.offset) query.append('offset', String(params.offset));

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<AuditLogsResponse>(`/audit-logs${qs}`);
  }

  // Vaults & Storage Locations API
  async getVaults(): Promise<VaultRecord[]> {
    const res = await this.request<{ success: boolean; vaults: VaultRecord[] }>('/vaults');
    return res.vaults || [];
  }

  async createVault(data: { name: string; description?: string }): Promise<VaultRecord> {
    const res = await this.request<{ success: boolean; vault: VaultRecord }>('/vaults', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.vault;
  }

  async updateVault(id: string, data: Partial<VaultRecord>): Promise<VaultRecord> {
    const res = await this.request<{ success: boolean; vault: VaultRecord }>(`/vaults/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return res.vault;
  }

  async deleteVault(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/vaults/${id}`, {
      method: 'DELETE'
    });
  }

  // Consumables (Expendables) API
  async getConsumables(query?: { category?: string; location_id?: string; search?: string }) {
    const params = new URLSearchParams();
    if (query?.category && query.category !== 'all') params.append('category', query.category);
    if (query?.location_id && query.location_id !== 'all') params.append('location_id', query.location_id);
    if (query?.search) params.append('search', query.search);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request<{
      success: boolean;
      count: number;
      low_stock_count: number;
      consumables: ConsumableRecord[];
    }>(`/consumables${qs}`);
    return res;
  }

  async createConsumable(data: Partial<ConsumableRecord>): Promise<ConsumableRecord> {
    const res = await this.request<{ success: boolean; consumable: ConsumableRecord }>('/consumables', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.consumable;
  }

  async updateConsumable(id: string, data: Partial<ConsumableRecord>): Promise<ConsumableRecord> {
    const res = await this.request<{ success: boolean; consumable: ConsumableRecord }>(`/consumables/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return res.consumable;
  }

  async adjustConsumableStock(id: string, data: { action: 'add' | 'deduct'; amount: number; reason?: string }) {
    return this.request<{ success: boolean; previous_stock: number; new_stock: number; consumable: ConsumableRecord }>(
      `/consumables/${id}/adjust-stock`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  }

  async deleteConsumable(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/consumables/${id}`, {
      method: 'DELETE'
    });
  }

  // Equipment Kits & Flight Cases API
  async getKits(query?: { location_id?: string; search?: string }): Promise<AssetKitRecord[]> {
    const params = new URLSearchParams();
    if (query?.location_id && query.location_id !== 'all') params.append('location_id', query.location_id);
    if (query?.search) params.append('search', query.search);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request<{ success: boolean; kits: AssetKitRecord[] }>(`/kits${qs}`);
    return res.kits || [];
  }

  async createKit(data: {
    name: string;
    code?: string;
    category?: string;
    total_kits_count?: number;
    location_id?: string;
    description?: string;
    items?: KitItemRecord[];
  }): Promise<AssetKitRecord> {
    const res = await this.request<{ success: boolean; kit: AssetKitRecord }>('/kits', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.kit;
  }

  async updateKit(id: string, data: Partial<AssetKitRecord>): Promise<AssetKitRecord> {
    const res = await this.request<{ success: boolean; kit: AssetKitRecord }>(`/kits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return res.kit;
  }

  async deleteKit(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/kits/${id}`, {
      method: 'DELETE'
    });
  }

  // Zorvik-AI Intelligent Allocation Engine
  async recommendAllocation(params: {
    shoot_title: string;
    shoot_venue?: string;
    package_name?: string;
    start_time?: string;
    end_time?: string;
    client_name?: string;
    notes?: string;
  }): Promise<{ success: boolean; model: string; recommendation: AIRecommendation }> {
    return this.request<{ success: boolean; model: string; recommendation: AIRecommendation }>('/ai/recommend-allocation', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async askAssistant(params: {
    query: string;
    conversation_history?: Array<{ role: 'user' | 'assistant'; text: string }>;
    session_id?: string;
    files?: Array<{ name: string; mimeType: string; data: string }>;
  }): Promise<{ success: boolean; model: string; answer: string }> {
    return this.request<{ success: boolean; model: string; answer: string }>('/ai/ask-assistant', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
}

export interface AIRecommendation {
  recommended_asset_ids: string[];
  recommended_worker_ids: string[];
  recommended_kit_names?: string[];
  gear_manifest: Array<{ category: string; item_name: string; reason: string }>;
  crew_roles: Array<{ role: string; suggested_count: number; reason: string }>;
  critical_tips: string[];
  confidence_score: number;
  ai_summary: string;
}

export const api = new ApiClient();
