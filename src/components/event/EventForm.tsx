'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Define Yup validation schema
const eventSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().optional(),
  date: yup.date().required('Date is required'),
  location: yup.string().required('Location is required'),
  type: yup.string().oneOf(['free', 'premium'], 'Type must be free or premium').required('Event type is required'),
  bannerUrl: yup.string().url('Must be a valid URL').optional(),
  contactEmail: yup.string().email('Must be a valid email').required('Contact email is required'),
  contactPhone: yup.string().matches(/^\d{10}$/, 'Phone number must be 10 digits').required('Contact phone is required'),
});

const EventForm = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Initialize React Hook Form with Yup resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(eventSchema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        alert('Event created successfully');
        router.push('/events');
      } else {
        alert('Error creating event');
      }
    } catch (error) {
      console.error(error);
      alert('Error creating event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='mt-20'>
        <label>Title</label>
        <input {...register('title')} placeholder="Title" />
        {errors.title && <p>{errors.title.message}</p>}
      </div>

      <div>
        <label>Description</label>
        <textarea {...register('description')} placeholder="Description" />
        {errors.description && <p>{errors.description.message}</p>}
      </div>

      <div>
        <label>Date</label>
        <input type="date" {...register('date')} />
        {errors.date && <p>{errors.date.message}</p>}
      </div>

      <div>
        <label>Location</label>
        <input {...register('location')} placeholder="Location" />
        {errors.location && <p>{errors.location.message}</p>}
      </div>

      <div>
        <label>Type</label>
        <select {...register('type')}>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
        </select>
        {errors.type && <p>{errors.type.message}</p>}
      </div>

      <div>
        <label>Banner URL</label>
        <input {...register('bannerUrl')} placeholder="Banner URL" />
        {errors.bannerUrl && <p>{errors.bannerUrl.message}</p>}
      </div>

      <div>
        <label>Contact Email</label>
        <input {...register('contactEmail')} placeholder="Contact Email" />
        {errors.contactEmail && <p>{errors.contactEmail.message}</p>}
      </div>

      <div>
        <label>Contact Phone</label>
        <input {...register('contactPhone')} placeholder="Contact Phone" />
        {errors.contactPhone && <p>{errors.contactPhone.message}</p>}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  );
};

export default EventForm;
