export const getAsaasConfig = () => {
  const apiKey = Deno.env.get('ASAAS_API_KEY') ?? ''
  const apiUrl = (Deno.env.get('ASAAS_API_URL') ?? 'https://api-sandbox.asaas.com').replace(/\/$/, '')

  if (!apiKey) throw new Error('ASAAS_API_KEY não configurada')
  return { apiKey, apiUrl }
}

const asaasRequest = async (path: string, options: RequestInit = {}) => {
  const { apiKey, apiUrl } = getAsaasConfig()
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'GestaoSindical/1.0 (Supabase Edge Function)',
      'access_token': apiKey,
      ...(options.headers ?? {}),
    },
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(`Asaas ${response.status}: ${JSON.stringify(body)}`)
  }
  return body
}

export const findOrCreateAsaasCustomer = async (company: any) => {
  const cpfCnpj = String(company.cnpj ?? '').replace(/\D/g, '')
  if (!cpfCnpj) throw new Error(`Empresa ${company.id} sem CNPJ válido`)

  const search = await asaasRequest(`/v3/customers?cpfCnpj=${encodeURIComponent(cpfCnpj)}`)
  if (search.data?.[0]?.id) return search.data[0]

  return asaasRequest('/v3/customers', {
    method: 'POST',
    body: JSON.stringify({
      name: company.name,
      cpfCnpj,
      mobilePhone: company.whatsapp || company.phone || undefined,
      postalCode: company.zip_code || undefined,
      address: company.street || undefined,
      addressNumber: company.number || undefined,
      province: company.neighborhood || undefined,
      city: company.city || undefined,
      state: company.state || undefined,
      notificationDisabled: true,
    }),
  })
}

export const deleteAsaasPayment = async (paymentId: string) => {
  return asaasRequest(`/v3/payments/${encodeURIComponent(paymentId)}`, { method: 'DELETE' })
}

export const createAsaasBoleto = async ({ company, invoice }: { company: any, invoice: any }) => {
  const customer = await findOrCreateAsaasCustomer(company)
  const payment = await asaasRequest('/v3/payments', {
    method: 'POST',
    body: JSON.stringify({
      customer: customer.id,
      billingType: 'BOLETO',
      value: Number(invoice.amount),
      dueDate: invoice.due_date,
      description: invoice.description || `Contribuição sindical - ${invoice.month_year}`,
      externalReference: invoice.id,
    }),
  })

  return { customer, payment }
}
