import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { citizenApi } from '../../api/citizenApi'
import { useState } from 'react'

const schema = z.object({
  fullName: z.string().min(2),
  dob: z.string().min(1),
  aadhaarRef: z.string().regex(/^\d{12}$/, 'Must be exactly 12 digits'),
  address: z.string().min(5),
  district: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email(),
})

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const [result, setResult] = useState<{ status: string; message: string } | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    const res = await citizenApi.register(data)
    setResult(res)
  }

  if (result) {
    return (
      <div style={{ padding: 32, maxWidth: 480, margin: '0 auto' }}>
        <h2>Registration {result.status === 'ACTIVE' ? 'Successful' : 'Failed'}</h2>
        <p>{result.message}</p>
        {result.status === 'ACTIVE' && (
          <a href="/">Go to Login</a>
        )}
      </div>
    )
  }

  return (
    <div style={{ padding: 32, maxWidth: 480, margin: '0 auto' }}>
      <h2>Citizen Registration</h2>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Register with your Aadhaar number to file complaints with the police.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="Full Name" error={errors.fullName?.message}>
          <input {...register('fullName')} />
        </Field>
        <Field label="Date of Birth" error={errors.dob?.message}>
          <input type="date" {...register('dob')} />
        </Field>
        <Field label="Aadhaar Number (12 digits)" error={errors.aadhaarRef?.message}>
          <input {...register('aadhaarRef')} maxLength={12} />
        </Field>
        <Field label="Address" error={errors.address?.message}>
          <textarea {...register('address')} />
        </Field>
        <Field label="District" error={errors.district?.message}>
          <input {...register('district')} />
        </Field>
        <Field label="State" error={errors.state?.message}>
          <input {...register('state')} />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <input {...register('phone')} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input type="email" {...register('email')} />
        </Field>
        <button type="submit" style={{ marginTop: 8, padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4 }}>
          Register
        </button>
      </form>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>{label}</label>
      {children}
      {error && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 2 }}>{error}</p>}
    </div>
  )
}
