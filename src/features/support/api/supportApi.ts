import { apiGet, apiPost } from '@api/client';

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'resolved';
  evidenceImage: string | null;
  adminResponse: string | null;
  adminResponseAt: string | null;
  createdAt: string;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  evidenceImage?: string;
}

export function fetchTickets(): Promise<SupportTicket[]> {
  return apiGet<SupportTicket[]>('/support');
}

export function createTicket(
  payload: CreateTicketPayload,
): Promise<{ success: boolean; id: string }> {
  return apiPost<{ success: boolean; id: string }>('/support', payload);
}
