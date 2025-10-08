import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase, isSupabaseEnabled } from '../services/supabaseClient'
import { mockAccounts } from '../data/mockAccounts'
import { mockAdmins } from '../data/mockAdmins'

const MS_PER_DAY = 1000 * 60 * 60 * 24

const normalizeDate = (value) => (value ? value : null)

const calculateDurationDays = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return null
  }
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null
  }
  return Math.round((end - start) / MS_PER_DAY) + 1
}

const normalizeAdmin = (admin) => {
  const startDate = normalizeDate(admin.start_date ?? admin.startDate)
  const endDate = normalizeDate(admin.end_date ?? admin.expirationDate ?? admin.endDate)

  return {
    id: admin.id,
    name: admin.admin_name ?? admin.name ?? '',
    startDate,
    expirationDate: endDate,
    specialization: admin.description ?? admin.specialization ?? '',
    password: admin.admin_password ?? admin.password ?? '',
    notes: admin.other ?? admin.notes ?? '',
    createdAt: admin.created_at ?? admin.createdAt ?? null,
  }
}

const normalizeAccount = (account) => {
  const startDate = normalizeDate(account.start_date ?? account.startDate)
  const endDate = normalizeDate(account.end_date ?? account.expirationDate ?? account.endDate)
  const authorizedBy = account.authorized_by ?? account.authorizedBy ?? null

  return {
    id: account.id,
    name: account.name ?? '',
    authorizedBy,
    startDate,
    expirationDate: endDate,
    durationDays:
      account.long_times ??
      account.durationDays ??
      calculateDurationDays(startDate, endDate) ??
      null,
    createdAt: account.created_at ?? account.createdAt ?? null,
  }
}

const toSupabaseAdminPayload = ({
  name,
  startDate,
  endDate,
  specialization = '',
  password = '',
  notes = '',
}) => ({
  admin_name: name,
  start_date: startDate || null,
  end_date: endDate || null,
  description: specialization || null,
  admin_password: password || null,
  other: notes || null,
})

const toSupabaseAccountPayload = ({
  name,
  authorizedBy,
  startDate,
  endDate,
  durationDays,
}) => ({
  name,
  authorized_by: authorizedBy || null,
  start_date: startDate || null,
  end_date: endDate || null,
  long_times:
    durationDays ??
    (startDate && endDate ? calculateDurationDays(startDate, endDate) : null),
})

export const useSupabaseData = () => {
  const [accounts, setAccounts] = useState(() => mockAccounts.map(normalizeAccount))
  const [admins, setAdmins] = useState(() => mockAdmins.map(normalizeAdmin))
  const [isLoading, setIsLoading] = useState(() => isSupabaseEnabled)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    if (!isSupabaseEnabled) {
      setIsLoading(false)
      setError(null)
      setAdmins(mockAdmins.map(normalizeAdmin))
      setAccounts(mockAccounts.map(normalizeAccount))
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const [{ data: adminRows, error: adminError }, { data: accountRows, error: accountError }] =
        await Promise.all([
          supabase.from('admins_table').select('*').order('start_date'),
          supabase.from('accounts_table').select('*').order('start_date'),
        ])

      if (adminError || accountError) {
        throw adminError ?? accountError
      }

      setAdmins((adminRows ?? []).map(normalizeAdmin))
      setAccounts((accountRows ?? []).map(normalizeAccount))
    } catch (err) {
      console.error('Failed to fetch Supabase data', err)
      setError(err)
      setAdmins(mockAdmins.map(normalizeAdmin))
      setAccounts(mockAccounts.map(normalizeAccount))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseEnabled) {
      setIsLoading(false)
      return
    }
    fetchData()
  }, [fetchData])

  const stats = useMemo(
    () => ({
      totalAccounts: accounts.length,
      totalAdmins: admins.length,
    }),
    [accounts, admins],
  )

  const addAdmin = useCallback(
    async ({ name, startDate, endDate, specialization, password, notes }) => {
      const payload = toSupabaseAdminPayload({
        name,
        startDate,
        endDate,
        specialization,
        password,
        notes,
      })

      if (!isSupabaseEnabled) {
        const localAdmin = normalizeAdmin({
          id: `temp-admin-${Date.now()}`,
          ...payload,
        })
        setAdmins((prev) => [...prev, localAdmin])
        return { status: 'mock', admin: localAdmin }
      }

      const { error: insertError } = await supabase.from('admins_table').insert([payload])
      if (insertError) {
        throw insertError
      }

      await fetchData()
      return { status: 'synced' }
    },
    [fetchData],
  )

  const updateAdmin = useCallback(
    async (id, updates) => {
      const payload = toSupabaseAdminPayload(updates)

      if (!isSupabaseEnabled) {
        setAdmins((prev) =>
          prev.map((admin) => {
            if (admin.id !== id) {
              return admin
            }
            return {
              ...admin,
              name: updates.name ?? admin.name,
              startDate: updates.startDate ?? admin.startDate,
              expirationDate:
                updates.endDate ?? updates.expirationDate ?? admin.expirationDate,
              specialization: updates.specialization ?? admin.specialization,
              password: updates.password ?? admin.password,
              notes: updates.notes ?? admin.notes,
            }
          }),
        )
        return { status: 'mock' }
      }

      const { error: updateError } = await supabase
        .from('admins_table')
        .update(payload)
        .eq('id', id)

      if (updateError) {
        throw updateError
      }

      await fetchData()
      return { status: 'synced' }
    },
    [fetchData],
  )

  const deleteAdmin = useCallback(
    async (id) => {
      if (!isSupabaseEnabled) {
        setAdmins((prev) => prev.filter((admin) => admin.id !== id))
        setAccounts((prev) =>
          prev.map((account) =>
            account.authorizedBy === id ? { ...account, authorizedBy: null } : account,
          ),
        )
        return { status: 'mock' }
      }

      const { error: deleteError } = await supabase.from('admins_table').delete().eq('id', id)
      if (deleteError) {
        throw deleteError
      }

      await fetchData()
      return { status: 'synced' }
    },
    [fetchData],
  )

  const addAccount = useCallback(
    async ({ name, authorizedBy, startDate, endDate, durationDays }) => {
      const payload = toSupabaseAccountPayload({
        name,
        authorizedBy,
        startDate,
        endDate,
        durationDays,
      })

      if (!isSupabaseEnabled) {
        const localAccount = normalizeAccount({
          id: `temp-account-${Date.now()}`,
          ...payload,
        })
        setAccounts((prev) => [...prev, localAccount])
        return { status: 'mock', account: localAccount }
      }

      const { error: insertError } = await supabase
        .from('accounts_table')
        .insert([{ ...payload }])

      if (insertError) {
        throw insertError
      }

      await fetchData()
      return { status: 'synced' }
    },
    [fetchData],
  )

  const updateAccount = useCallback(
    async (id, updates) => {
      const payload = toSupabaseAccountPayload(updates)

      if (!isSupabaseEnabled) {
        setAccounts((prev) =>
          prev.map((account) => {
            if (account.id !== id) {
              return account
            }
            const nextStart = updates.startDate ?? account.startDate
            const nextEnd =
              updates.endDate ?? updates.expirationDate ?? account.expirationDate
            return {
              ...account,
              name: updates.name ?? account.name,
              authorizedBy: updates.authorizedBy ?? account.authorizedBy,
              startDate: nextStart,
              expirationDate: nextEnd,
              durationDays:
                updates.durationDays ?? calculateDurationDays(nextStart, nextEnd) ?? account.durationDays,
            }
          }),
        )
        return { status: 'mock' }
      }

      const { error: updateError } = await supabase
        .from('accounts_table')
        .update(payload)
        .eq('id', id)

      if (updateError) {
        throw updateError
      }

      await fetchData()
      return { status: 'synced' }
    },
    [fetchData],
  )

  const deleteAccount = useCallback(
    async (id) => {
      if (!isSupabaseEnabled) {
        setAccounts((prev) => prev.filter((account) => account.id !== id))
        return { status: 'mock' }
      }

      const { error: deleteError } = await supabase.from('accounts_table').delete().eq('id', id)
      if (deleteError) {
        throw deleteError
      }

      await fetchData()
      return { status: 'synced' }
    },
    [fetchData],
  )

  return {
    accounts,
    admins,
    stats,
    isLoading,
    error,
    refresh: fetchData,
    isSupabaseEnabled,
    addAdmin,
    updateAdmin,
    deleteAdmin,
    addAccount,
    updateAccount,
    deleteAccount,
  }
}
