'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/unistay/auth-context';
import {
  MapPin, BedDouble, Ruler, Calendar, ChevronLeft, ChevronRight,
  Heart, Share2, Wifi, Car, Sofa, Zap, TreePine, CheckCircle2,
  Mail, Phone, Send, Lock, Loader2,
} from 'lucide-react';
import { Button } from '@/components/unistay/ui/button';
import { Card } from '@/components/unistay/ui/card';
import { casaProperties } from '@/lib/unistay/properties';
import { useFirestoreProperty } from '@/lib/unistay/useFirestoreListings';
import { FieldLabel, SoftInput, SoftTextarea, PrimaryBtn } from '@/components/unistay/ui/form-elements';
import { Breadcrumbs } from '@/components/unistay/ui/breadcrumbs';
import type { CasaProperty } from '@/lib/unistay/types';

const FEATURE_ICONS: Record<string, { icon: React.ReactNode; label: string }> = {
  furnished: { icon: <Sofa className="h-5 w-5" />,     label: 'Furnished' },
  wifi:      { icon: <Wifi className="h-5 w-5" />,     label: 'WiFi included' },
  bills:     { icon: <Zap className="h-5 w-5" />,      label: 'Bills included' },
  parking:   { icon: <Car className="h-5 w-5" />,      label: 'Parking' },
  balcony:   { icon: <TreePine className="h-5 w-5" />, label: 'Balcony' },
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-');
  return `${parseInt(day)} ${MONTHS[parseInt(month) - 1]} ${year}`;
}

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

type FormErrors = { name?: string; email?: string; message?: string; _form?: string };

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const { property: firestoreProperty, loading: propLoading } = useFirestoreProperty(id);
  const staticProperty = casaProperties.find((p) => p.id === id) ?? null;
  const property: CasaProperty | null = firestoreProperty ?? staticProperty;

  const [imageIndex, setImageIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  // Form state
  const [formName, setFormName]       = useState('');
  const [formEmail, setFormEmail]     = useState('');
  const [formPhone, setFormPhone]     = useState('');
  const [formMoveIn, setFormMoveIn]   = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formErrors, setFormErrors]   = useState<FormErrors>({});
  const [submitting, setSubmitting]   = useState(false);
  const [formSent, setFormSent]       = useState(false);

  // Mobile sticky bar visibility
  const formRef = useRef<HTMLDivElement>(null);
  const [formVisible, setFormVisible] = useState(false);
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setFormVisible(entry.isIntersecting), { threshold: 0.1 }); // eslint-disable-line react-hooks/set-state-in-effect
    obs.observe(el);
    return () => obs.disconnect();
  }, [formRef.current]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user) {
      setFormName(user.displayName ?? '');   // eslint-disable-line react-hooks/set-state-in-effect
      setFormEmail(user.email ?? '');        // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [user]);

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: property?.title ?? 'Property', url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      });
    }
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!formName.trim() || formName.trim().length < 2)
      errs.name = 'Please enter your full name.';
    if (!formEmail || !isValidEmail(formEmail))
      errs.email = 'Please enter a valid email address.';
    if (!formMessage.trim() || formMessage.trim().length < 10)
      errs.message = 'Message must be at least 10 characters.';
    return errs;
  }

  async function handleEnquiry(e: React.SyntheticEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});
    setSubmitting(true);
    try {
      const res = await fetch('/api/unistay/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim() || undefined,
          moveIn: formMoveIn || undefined,
          message: formMessage.trim(),
          propertyId: id,
          propertyTitle: property?.title ?? '',
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        if (data.errors) {
          setFormErrors(data.errors);
        } else {
          setFormErrors({ _form: data.error ?? 'Something went wrong. Please try again.' });
        }
        return;
      }
      setFormSent(true);
    } catch {
      setFormErrors({ _form: 'Network error. Please check your connection and try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Loading states ── */
  if (propLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 pt-8 pb-8 max-w-6xl">
          {/* skeleton nav */}
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-6" />
          {/* skeleton gallery */}
          <div className="h-72 sm:h-96 rounded-2xl bg-gray-200 animate-pulse mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 w-2/3 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
              <div className="grid grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}
              </div>
              <div className="space-y-2">
                {[1,2,3,4].map(i => <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />)}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-36 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Property not found.</p>
          <Link href="/unistay/search" className="text-blue-600 hover:underline text-sm">← Back to search</Link>
        </div>
      </div>
    );
  }

  const images = property.images;
  const billsIncluded = property.features.includes('bills');

  function prevImage() { setImageIndex((i) => (i === 0 ? images.length - 1 : i - 1)); }
  function nextImage() { setImageIndex((i) => (i === images.length - 1 ? 0 : i + 1)); }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 pt-8 pb-24 max-w-6xl">

        {/* Nav */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <Breadcrumbs
            crumbs={[
              { label: 'Home', href: '/' },
              { label: 'UniStay', href: '/unistay/browse' },
              { label: 'Search', href: '/unistay/search' },
              { label: property.title },
            ]}
            className=""
          />
        </div>

        {/* Image Gallery */}
        <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden mb-4 bg-gray-200">
          <Image src={images[imageIndex]} alt={property.title} fill className="object-cover" />

          {images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow transition">
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow transition">
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>
            </>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button key={i} onClick={() => setImageIndex(i)} className={`w-2 h-2 rounded-full transition-colors ${i === imageIndex ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
          )}

          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
              Casa Managed
            </span>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={() => setSaved((s) => !s)} className="bg-white/90 hover:bg-white rounded-full p-2 shadow transition">
              <Heart className={`h-5 w-5 ${saved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
            <button onClick={handleShare} title={shared ? 'Link copied!' : 'Share'} className="bg-white/90 hover:bg-white rounded-full p-2 shadow transition">
              <Share2 className={`h-5 w-5 ${shared ? 'text-blue-600' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
            {images.map((src, i) => (
              <button key={i} onClick={() => setImageIndex(i)} className={`relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition ${i === imageIndex ? 'border-blue-600' : 'border-transparent'}`}>
                <Image src={src} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <p className="text-gray-500 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0" />
                {property.address}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: <BedDouble className="h-5 w-5 text-blue-600" />, label: 'Bedrooms',       value: `${property.bedrooms} bed` },
                { icon: <Ruler    className="h-5 w-5 text-blue-600" />, label: 'Size',            value: `${property.size} m²` },
                { icon: <Calendar className="h-5 w-5 text-blue-600" />, label: 'Available from',  value: formatDate(property.availableFrom) },
              ].map(({ icon, label, value }) => (
                <Card key={label} className="p-4 text-center">
                  <div className="flex justify-center mb-1">{icon}</div>
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-gray-800">{value}</p>
                </Card>
              ))}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">About this property</h2>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>

            {property.features.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">What&apos;s included</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.features.map((f) => {
                    const feat = FEATURE_ICONS[f];
                    return (
                      <div key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                        <div className="text-blue-600">{feat?.icon ?? <CheckCircle2 className="h-5 w-5" />}</div>
                        {feat?.label ?? f}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Price + Enquiry */}
          <div className="space-y-4">
            {/* Price card */}
            <Card className="p-5">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-gray-900">€{property.price.toLocaleString()}</span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
              <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-3 ${billsIncluded ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {billsIncluded ? 'Bills included' : 'Bills not included'}
              </span>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Property type</span>
                  <span className="font-medium capitalize text-gray-800">{property.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>City</span>
                  <span className="font-medium text-gray-800">{property.city}</span>
                </div>
              </div>
            </Card>

            {/* Enquiry form */}
            <Card className="p-5" ref={formRef}>
              <h3 className="font-semibold text-gray-900 mb-4">Contact Casa</h3>

              {authLoading ? (
                <div className="flex items-center justify-center py-8 gap-2 text-sm text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </div>
              ) : !user ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lock className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">Sign in to send an enquiry</p>
                  <p className="text-sm text-gray-500 mb-4">Create a free account to contact Casa about this property.</p>
                  <Link href="/unistay/auth">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-2">Sign in</Button>
                  </Link>
                  <Link href="/unistay/register">
                    <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:border-blue-400">Create free account</Button>
                  </Link>
                </div>
              ) : formSent ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">Thanks {formName.split(' ')[0]}!</p>
                  <p className="text-sm text-gray-500">
                    We&apos;ll be in touch within 24 hours about{' '}
                    <span className="font-medium">{property.title}</span>. Check your email for a confirmation.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEnquiry} className="space-y-4" noValidate>
                  {formErrors._form && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      {formErrors._form}
                    </div>
                  )}

                  <div>
                    <FieldLabel>Your name</FieldLabel>
                    <SoftInput
                      type="text"
                      value={formName}
                      onChange={(e) => { setFormName(e.target.value); setFormErrors((p) => ({ ...p, name: undefined })); }}
                      placeholder="Jane Smith"
                      error={formErrors.name}
                    />
                  </div>

                  <div>
                    <FieldLabel>Email</FieldLabel>
                    <SoftInput
                      icon={Mail}
                      type="email"
                      value={formEmail}
                      onChange={(e) => { setFormEmail(e.target.value); setFormErrors((p) => ({ ...p, email: undefined })); }}
                      placeholder="you@example.com"
                      error={formErrors.email}
                    />
                  </div>

                  <div>
                    <FieldLabel>Phone <span className="normal-case font-normal text-gray-300">(optional)</span></FieldLabel>
                    <SoftInput
                      icon={Phone}
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+49 ..."
                    />
                  </div>

                  <div>
                    <FieldLabel>Intended move-in date <span className="normal-case font-normal text-gray-300">(optional)</span></FieldLabel>
                    <SoftInput
                      type="date"
                      value={formMoveIn}
                      onChange={(e) => setFormMoveIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <FieldLabel>Message</FieldLabel>
                    <SoftTextarea
                      value={formMessage}
                      onChange={(e) => { setFormMessage(e.target.value); setFormErrors((p) => ({ ...p, message: undefined })); }}
                      rows={3}
                      placeholder={`Hi, I am interested in ${property.title}…`}
                      error={formErrors.message}
                    />
                  </div>

                  <PrimaryBtn type="submit" disabled={submitting} className="w-full">
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Enquiry
                      </>
                    )}
                  </PrimaryBtn>
                  <p className="text-xs text-gray-300 text-center">We typically reply within 24 hours</p>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile sticky enquiry bar — hidden once form is in view */}
      {!formVisible && !formSent && user && (
        <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
          <button
            onClick={scrollToForm}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Send className="h-4 w-4" />
            Enquire about this property
          </button>
        </div>
      )}
    </div>
  );
}
