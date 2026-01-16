import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createBooking, getFormFields, getBookingById } from './firebase';
import { QRCodeGenerator } from './QRCodeGenerator';
import { ThemeToggle } from './ThemeToggle';
import { sendBookingEmail } from './email';

function generateZodSchema(fields) {
  const schemaObject = {};
  
  fields.forEach(field => {
    let fieldSchema;
    
    switch (field.type) {
      case 'email':
        fieldSchema = z.string().email(field.label + ' must be a valid email');
        break;
        
      case 'number':
        fieldSchema = z.number({
          required_error: field.label + ' is required',
          invalid_type_error: field.label + ' must be a number'
        })
        if (typeof field.min === 'number') {
          fieldSchema = fieldSchema.min(field.min, `${field.label} must be at least ${field.min}`);
        }
        if (typeof field.max === 'number') {
          fieldSchema = fieldSchema.max(field.max, `${field.label} must be at most ${field.max}`);
        }
        break;
        
      case 'date':
      case 'datetime-local':
        fieldSchema = z.string()
          .refine(val => !isNaN(new Date(val).getTime()), {
            message: `${field.label} must be a valid date`
          });
        break;
        
      case 'tel':
        fieldSchema = z.string()
          .min(field.minLength || 10, `${field.label} must be at least ${field.minLength || 10} characters`);
        break;
        
      default:
        fieldSchema = z.string();
        if (field.minLength) {
          fieldSchema = fieldSchema.min(field.minLength, `${field.label} must be at least ${field.minLength} characters`);
        }
    }

    // Handle required fields
    schemaObject[field.name] = field.required 
      ? fieldSchema 
      : fieldSchema.optional();
  });

  return z.object(schemaObject);
}

export default function BookingForm() {
  const [bookingId, setBookingId] = useState(null);
  const [formFields, setFormFields] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const [paperIdInput, setPaperIdInput] = useState('');
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);
  const [fetchSuccess, setFetchSuccess] = useState(false);

  useEffect(() => {
    const loadFormFields = async () => {
      try {
        const settings = await getFormFields();
        if (settings?.fields) {
          setFormFields(settings.fields);
        } else {
          // Default fields if no settings found
          setFormFields([
            { 
              id: 1, 
              name: 'fullName', 
              label: 'Full Name', 
              type: 'text', 
              required: true,
              minLength: 2
            },
            { 
              id: 2, 
              name: 'email',
              label: 'Email', 
              type: 'email', 
              required: true
            },
            { 
              id: 3, 
              name: 'date',
              label: 'Date & Time', 
              type: 'datetime-local', 
              required: true
            }
          ]);
        }
      } catch (err) {
        console.error('Error loading form fields:', err);
        setError('Failed to load form. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadFormFields();
  }, []);

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm({
    resolver: zodResolver(generateZodSchema(formFields))
  });

  const handleFetchBooking = async () => {
    if (!paperIdInput.trim()) {
      setError('Please enter a paper ID');
      return;
    }

    setIsLoadingBooking(true);
    setError(null);
    
    try {
      const bookingData = await getBookingById(paperIdInput.trim());
      
      if (!bookingData) {
        setError('Paper ID not found. Please check the ID and try again.');
        setIsLoadingBooking(false);
        return;
      }

      // Auto-fill the form with the fetched data
      Object.keys(bookingData).forEach((key) => {
        if (bookingData[key] !== undefined && bookingData[key] !== null) {
          setValue(key, bookingData[key]);
        }
      });
      
      setError(null);
      setFetchSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => setFetchSuccess(false), 3000);
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError('Failed to fetch booking. Please try again.');
    } finally {
      setIsLoadingBooking(false);
    }
  };

  const handleReset = () => {
    setBookingId(null);
    setPaperIdInput('');
    setError(null);
    setEmailStatus(null);
    setFetchSuccess(false);
    reset(); // Reset the form fields
  };

  const onSubmit = async (data) => {
    try {
      setError(null);
      setIsSubmitting(true);
      setEmailStatus(null);
      
      const id = await createBooking(data);
      
      if (data.email) {
        try {
          await sendBookingEmail(data, id);
          setEmailStatus('Confirmation email sent!');
        } catch (emailError) {
          console.error('Failed to send email:', emailError);
          setEmailStatus('Booking confirmed but email delivery failed.');
        }
      }
      
      setBookingId(id);
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">RAM-SITA 2K26</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition"
            >
              Reset
            </button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="container max-w-md mx-auto py-8 px-4">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {!bookingId ? (
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Make a Reservation</h2>
            
            {/* Paper ID Input Bar */}
            <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border">
              <label className="block text-sm font-medium mb-2">
                Enter Paper ID to Auto-fill Form
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={paperIdInput}
                  onChange={(e) => {
                    setPaperIdInput(e.target.value);
                    setFetchSuccess(false);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleFetchBooking();
                    }
                  }}
                  placeholder="Enter paper ID"
                  className="flex-1 p-2 rounded-md border bg-background"
                />
                <button
                  type="button"
                  onClick={handleFetchBooking}
                  disabled={isLoadingBooking || !paperIdInput.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingBooking ? 'Loading...' : 'Fetch'}
                </button>
              </div>
              {fetchSuccess && (
                <p className="text-sm text-green-500 mt-2">
                  ✓ Booking details loaded successfully!
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Enter an existing paper ID to automatically fill the form with previous details
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {formFields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium mb-2">
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </label>
                  <input
                    {...register(field.name)}
                    type={field.type}
                    min={field.type === 'number' ? field.min : undefined}
                    max={field.type === 'number' ? field.max : undefined}
                    className="w-full p-2 rounded-md border bg-background"
                    placeholder={field.label}
                  />
                  {errors[field.name] && (
                    <p className="text-destructive text-sm mt-1">{errors[field.name].message}</p>
                  )}
                </div>
              ))}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Booking...' : 'Book Now'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Booking Confirmed!</h2>
            <div className="mb-4">
              <QRCodeGenerator value={bookingId} />
            </div>
            {emailStatus && (
              <div className="space-y-2">
                <p className={`text-sm ${
                  emailStatus.includes('failed') ? 'text-yellow-500' : 'text-green-500'
                }`}>
                  {emailStatus}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}