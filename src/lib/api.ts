// Typesafe API Client for ZManage Operations
// Connects ZManage-Web to ZManage-APIs (Port 4003)

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4003/api/v1';

export interface AssetRecord {
  id: string;
  client_id: string;
  project_id: string;
  name: string;
  code: string;
  category: string;
  serial_number: string;
  condition: 'excellent' | 'good' | 'fair' | 'in_repair';
  status: 'available' | 'on_shoot' | 'maintenance';
  purchase_date?: string;
  purchase_cost?: number;
  currency?: string;
  image_url?: string;
  specs?: Record<string, any>;
  maintenance_notes?: string;
  created_at?: string;
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
  shoot_title: string;
  shoot_venue?: string;
  shoot_date?: string;
  client_name?: string;
  client_phone?: string;
  start_time: string;
  end_time: string;
  asset_ids: string[];
  worker_ids: string[];
  status: 'draft' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  notes?: string;
  created_at?: string;
  assets?: AssetRecord[];
  workers?: WorkerRecord[];
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

export interface PayoutsSummary {
  pending_total: number;
  settled_total: number;
  pending_count: number;
  settled_count: number;
}

class ApiClient {
  private getHeaders(): HeadersInit {
    const sessionStr = localStorage.getItem('zmanage_session') || localStorage.getItem('zresource_session');
    let tenantId = '4321ffd8-648e-40e5-b1f0-d64956dfb62c';
    let token = '';

    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session.tenantId) tenantId = session.tenantId;
        if (session.token) token = session.token;
      } catch (e) {
        // use defaults
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': tenantId
    };

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

  // Assets
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

  // Workers & 1-Tap Team Onboarding
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

  // Payouts
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

  async settlePayout(id: string, utr_reference: string) {
    const res = await this.request<{ success: boolean; payout: PayoutRecord }>(`/payouts/${id}/settle`, {
      method: 'POST',
      body: JSON.stringify({ utr_reference })
    });
    return res.payout;
  }
}

export const api = new ApiClient();
