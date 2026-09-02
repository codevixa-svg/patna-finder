'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserAuthStore } from '@/store/userAuthStore';
import { userBusinessApi } from '@/lib/userApi';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const BACKEND_URL = API_BASE_URL.replace('/api/v1', ''); // Remove /api/v1 for direct file access

// Helper function to get full image URL
const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  
  // If already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If relative path, prepend backend URL (without /api/v1)
  if (imagePath.startsWith('/storage/')) {
    return `${BACKEND_URL}${imagePath}`;
  }
  
  // If just storage path without leading slash
  if (imagePath.startsWith('storage/')) {
    return `${BACKEND_URL}/${imagePath}`;
  }
  
  return imagePath;
};

type Category = {
  id: number;
  name: string;
  slug: string;
};

type Area = {
  id: number;
  name: string;
  slug: string;
};

type Service = {
  id: number;
  name: string;
  description: string;
  price: string;
  active: boolean;
};

type OpeningHours = {
  [key: string]: {
    is_open: boolean;
    open_time: string;
    close_time: string;
  };
};

type SocialLinks = {
  [key: string]: {
    enabled: boolean;
    url: string;
  };
};

function AddBusinessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isEditMode = !!editId;

  const { isAuthenticated, user } = useUserAuthStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  // API Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    tagline: '',
    short_description: '',
    description: '',
    established_year: '',
    logo: '',
    cover_image: '',
    phone: '',
    alternate_phone: '',
    email: '',
    website: '',
    whatsapp: '',
    inquiry_email: '',
    inquiry_preference: 'email',
    address: '',
    address_line2: '',
    city: 'Patna',
    state: 'Bihar',
    pincode: '',
    country: 'India',
    landmark: '',
    latitude: '',
    longitude: '',
    google_map_location: '',
    area_id: '',
  });

  const [services, setServices] = useState<Service[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHours>({
    monday: { is_open: true, open_time: '09:00', close_time: '18:00' },
    tuesday: { is_open: true, open_time: '09:00', close_time: '18:00' },
    wednesday: { is_open: true, open_time: '09:00', close_time: '18:00' },
    thursday: { is_open: true, open_time: '09:00', close_time: '18:00' },
    friday: { is_open: true, open_time: '09:00', close_time: '18:00' },
    saturday: { is_open: true, open_time: '09:00', close_time: '18:00' },
    sunday: { is_open: false, open_time: '09:00', close_time: '18:00' },
  });
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    facebook: { enabled: false, url: '' },
    instagram: { enabled: false, url: '' },
    twitter: { enabled: false, url: '' },
    linkedin: { enabled: false, url: '' },
    youtube: { enabled: false, url: '' },
    whatsapp_business: { enabled: false, url: '' },
    pinterest: { enabled: false, url: '' },
    other: { enabled: false, url: '' },
  });

  // Image preview states
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [coverPreview, setCoverPreview] = useState<string>('');
  
  // Gallery photos state - Step 6
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [videoLinks, setVideoLinks] = useState<string[]>([]);

  // Secondary category modal
  const [showSecondaryModal, setShowSecondaryModal] = useState(false);
  const [secondaryCategories, setSecondaryCategories] = useState<number[]>([]);

  // Preview Component
  const BusinessPreview = () => (
    <div className="hidden lg:block lg:col-span-4">
      <div className="lg:sticky lg:top-24">
        <div className="mb-4">
          <h3 className="text-base font-bold text-gray-900">Listing Preview</h3>
          <p className="text-xs text-gray-500">This is how your listing will appear</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="h-32 bg-gradient-to-br from-orange-400 to-orange-600 relative overflow-hidden">
            {/* Cover Image Preview */}
            {(coverPreview || formData.cover_image) && (
              <img
                src={coverPreview || getImageUrl(formData.cover_image)}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}

            <div className="absolute -bottom-8 left-4 z-10">
              <div className="w-16 h-16 bg-white rounded-lg border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                {/* Logo Preview */}
                {(logoPreview || formData.logo) ? (
                  <img
                    src={logoPreview || getImageUrl(formData.logo)}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">
                      {formData.name ? formData.name.substring(0, 2).toUpperCase() : 'AB'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-4 pt-10">
            <div className="flex items-start gap-2 mb-1">
              <h4 className="font-bold text-base text-gray-900">{formData.name || 'Business Name'}</h4>
              {formData.name && (
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            {formData.tagline && (
              <p className="text-sm text-blue-600 mb-2">{formData.tagline}</p>
            )}
            {!formData.tagline && formData.category_id && categories.length > 0 && (
              <p className="text-sm text-blue-600 mb-2">{categories.find(c => c.id.toString() === formData.category_id)?.name || 'Business Category'}</p>
            )}
            {formData.short_description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{formData.short_description}</p>
            )}
            <div className="space-y-2 text-sm">
              {formData.established_year && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Established in {formData.established_year}</span>
                </div>
              )}
              
              {/* Phone Number - Step 2 */}
              {formData.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+91 {formData.phone}</span>
                </div>
              )}
              
              {/* Email - Step 2 */}
              {formData.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate text-xs">{formData.email}</span>
                </div>
              )}
              
              {/* Website - Step 2 */}
              {formData.website && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span className="truncate text-xs">{formData.website}</span>
                </div>
              )}
              
              {/* WhatsApp - Step 2 */}
              {formData.whatsapp && (
                <div className="flex items-center gap-2 text-green-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span>+91 {formData.whatsapp}</span>
                </div>
              )}
              
              
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                  {formData.address && <span>{formData.address}</span>}
                  {!formData.address && <span>{formData.city || 'City'}, {formData.state || 'State'}</span>}
                  {formData.address && formData.landmark && <span>, {formData.landmark}</span>}
                  {formData.address && formData.pincode && <span>, {formData.pincode}</span>}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {(() => {
                  // Find today's day
                  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                  const today = daysOfWeek[new Date().getDay()] as keyof typeof openingHours;
                  const todayHours = openingHours[today];
                  
                  if (todayHours && todayHours.is_open) {
                    // Convert 24hr to 12hr format
                    const closeTime = todayHours.close_time;
                    const [hours, minutes] = closeTime.split(':');
                    const hour = parseInt(hours);
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    const displayHour = hour % 12 || 12;
                    
                    return (
                      <>
                        <span className="text-green-600 font-medium">Open</span>
                        <span>· Closes at {displayHour}:{minutes} {ampm}</span>
                      </>
                    );
                  } else {
                    return <span className="text-red-600 font-medium">Closed Today</span>;
                  }
                })()}
              </div>
              
              {/* Services Preview - Step 5 */}
              {services.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h5 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Services Offered</h5>
                  <div className="space-y-1.5">
                    {services.filter(s => s.active).slice(0, 3).map((service) => (
                      <div key={service.id} className="flex items-start gap-2">
                        <svg className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{service.name}</p>
                          {service.price && (
                            <p className="text-xs text-orange-600 font-semibold">{service.price}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {services.filter(s => s.active).length > 3 && (
                      <p className="text-xs text-gray-500 mt-2">+{services.filter(s => s.active).length - 3} more services</p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Social Links Preview - Step 7 */}
              {Object.entries(socialLinks).some(([_, link]) => link.enabled && link.url) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h5 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Follow Us</h5>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(socialLinks).filter(([_, link]) => link.enabled && link.url).map(([platform, link]) => (
                      <div 
                        key={platform} 
                        className="w-8 h-8 bg-gray-100 hover:bg-orange-500 rounded-full flex items-center justify-center text-gray-600 hover:text-white transition cursor-pointer"
                        title={link.url || 'No URL set'}
                      >
                        {platform === 'facebook' && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                        )}
                        {platform === 'instagram' && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        )}
                        {platform === 'twitter' && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                          </svg>
                        )}
                        {platform === 'linkedin' && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                        )}
                        {platform === 'youtube' && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                        )}
                        {(platform === 'whatsapp_business' || platform === 'whatsapp') && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                          </svg>
                        )}
                        {platform === 'pinterest' && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Gallery Photos Preview - Step 6 */}
              {galleryPhotos.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h5 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Photo Gallery</h5>
                  <div className="grid grid-cols-3 gap-1.5">
                    {galleryPhotos.slice(0, 6).map((photo, index) => (
                      <div key={index} className="aspect-square rounded overflow-hidden border border-gray-200">
                        <img
                          src={photo}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  {galleryPhotos.length > 6 && (
                    <p className="text-xs text-gray-500 mt-2">+{galleryPhotos.length - 6} more photos</p>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-1.5">
                <span className="text-yellow-500">★</span>
                <span className="font-semibold text-gray-900">New</span>
                <span className="text-gray-500">(No Reviews Yet)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">Tips</h4>
              <p className="text-xs text-gray-600">Complete all the steps to increase your visibility and get more customers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );


  useEffect(() => {
    setMounted(true);
    
    // Load saved data from localStorage if not in edit mode
    if (!isEditMode) {
      const savedFormData = localStorage.getItem('addBusinessFormData');
      const savedServices = localStorage.getItem('addBusinessServices');
      const savedOpeningHours = localStorage.getItem('addBusinessOpeningHours');
      const savedSocialLinks = localStorage.getItem('addBusinessSocialLinks');
      const savedCurrentStep = localStorage.getItem('addBusinessCurrentStep');
      const savedSecondaryCategories = localStorage.getItem('addBusinessSecondaryCategories');
      const savedGalleryPhotos = localStorage.getItem('addBusinessGalleryPhotos');
      
      if (savedFormData) {
        try {
          const parsedData = JSON.parse(savedFormData);
          setFormData(parsedData);
        } catch (error) {
          console.error('Error parsing saved form data:', error);
        }
      }
      
      if (savedServices) {
        try {
          setServices(JSON.parse(savedServices));
        } catch (error) {
          console.error('Error parsing saved services:', error);
        }
      }
      
      if (savedOpeningHours) {
        try {
          setOpeningHours(JSON.parse(savedOpeningHours));
        } catch (error) {
          console.error('Error parsing saved opening hours:', error);
        }
      }
      
      if (savedSocialLinks) {
        try {
          setSocialLinks(JSON.parse(savedSocialLinks));
        } catch (error) {
          console.error('Error parsing saved social links:', error);
        }
      }
      
      if (savedCurrentStep) {
        setCurrentStep(Number(savedCurrentStep));
      }
      
      if (savedSecondaryCategories) {
        try {
          setSecondaryCategories(JSON.parse(savedSecondaryCategories));
        } catch (error) {
          console.error('Error parsing saved secondary categories:', error);
        }
      }
      
      if (savedGalleryPhotos) {
        try {
          setGalleryPhotos(JSON.parse(savedGalleryPhotos));
        } catch (error) {
          console.error('Error parsing saved gallery photos:', error);
        }
      }
    } else {
      // Set current year for new entries
      setFormData(prev => ({
        ...prev,
        established_year: new Date().getFullYear().toString()
      }));
    }
    
    fetchCategories();
    fetchAreas();
  }, []);

  // Save form data to localStorage whenever it changes (only if not in edit mode)
  useEffect(() => {
    if (mounted && !isEditMode) {
      localStorage.setItem('addBusinessFormData', JSON.stringify(formData));
    }
  }, [formData, mounted, isEditMode]);

  // Save services to localStorage whenever they change
  useEffect(() => {
    if (mounted && !isEditMode) {
      localStorage.setItem('addBusinessServices', JSON.stringify(services));
    }
  }, [services, mounted, isEditMode]);

  // Save opening hours to localStorage whenever they change
  useEffect(() => {
    if (mounted && !isEditMode) {
      localStorage.setItem('addBusinessOpeningHours', JSON.stringify(openingHours));
    }
  }, [openingHours, mounted, isEditMode]);

  // Save social links to localStorage whenever they change
  useEffect(() => {
    if (mounted && !isEditMode) {
      localStorage.setItem('addBusinessSocialLinks', JSON.stringify(socialLinks));
    }
  }, [socialLinks, mounted, isEditMode]);

  // Save current step to localStorage whenever it changes
  useEffect(() => {
    if (mounted && !isEditMode) {
      localStorage.setItem('addBusinessCurrentStep', currentStep.toString());
    }
  }, [currentStep, mounted, isEditMode]);

  // Save secondary categories to localStorage whenever they change
  useEffect(() => {
    if (mounted && !isEditMode) {
      localStorage.setItem('addBusinessSecondaryCategories', JSON.stringify(secondaryCategories));
    }
  }, [secondaryCategories, mounted, isEditMode]);

  // Save gallery photos to localStorage whenever they change
  useEffect(() => {
    if (mounted && !isEditMode) {
      localStorage.setItem('addBusinessGalleryPhotos', JSON.stringify(galleryPhotos));
    }
  }, [galleryPhotos, mounted, isEditMode]);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/dashboard/login');
      return;
    }
    if (isEditMode && editId) {
      fetchBusiness();
    }
  }, [isAuthenticated, router, mounted, isEditMode, editId]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      // Backend returns array directly, not wrapped in data
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchAreas = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/areas`);
      // Backend returns array directly, not wrapped in data
      setAreas(response.data || []);
    } catch (error) {
      console.error('Failed to fetch areas:', error);
    }
  };

  const fetchBusiness = async () => {
    try {
      setLoading(true);
      const response = await userBusinessApi.getOne(Number(editId));
      const business = response.data;
      
      console.log('[Edit Mode] Fetched business:', business);
      
      setFormData(business);

      // Load services
      if (business.services) {
        setServices(JSON.parse(business.services));
      }
      
      // Load opening hours (API may return an object or a JSON string)
      if (business.opening_hours) {
        let loadedHours = business.opening_hours;
        if (typeof loadedHours === 'string') {
          try { loadedHours = JSON.parse(loadedHours); } catch { loadedHours = null; }
        }
        if (loadedHours && typeof loadedHours === 'object') {
          // Normalize any legacy fields to the canonical format used by this form
          const normalizedHours: Record<string, { is_open: boolean; open_time: string; close_time: string }> = {};
          Object.entries(loadedHours as Record<string, any>).forEach(([day, h]: [string, any]) => {
            if (!h || typeof h !== 'object') return;
            normalizedHours[day.toLowerCase()] = {
              is_open: typeof h.is_open === 'boolean' ? h.is_open : !(h.closed ?? false),
              open_time: h.open_time || h.open || '09:00',
              close_time: h.close_time || h.close || '18:00',
            };
          });
          if (Object.keys(normalizedHours).length > 0) {
            setOpeningHours(normalizedHours);
          }
        }
      }
      
      // Load social links
      if (business.social_links) {
        setSocialLinks(JSON.parse(business.social_links));
      }
      
      // Load gallery photos
      if (business.gallery) {
        const galleryData = typeof business.gallery === 'string' 
          ? JSON.parse(business.gallery) 
          : business.gallery;
        setGalleryPhotos(galleryData || []);
        console.log('[Edit Mode] Loaded gallery:', galleryData);
      }
      
      // Load logo preview
      if (business.logo) {
        const logoUrl = business.logo.startsWith('http') 
          ? business.logo 
          : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000'}${business.logo}`;
        setLogoPreview(logoUrl);
        console.log('[Edit Mode] Logo preview:', logoUrl);
      }
      
      // Load cover preview
      if (business.cover_image) {
        const coverUrl = business.cover_image.startsWith('http') 
          ? business.cover_image 
          : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000'}${business.cover_image}`;
        setCoverPreview(coverUrl);
        console.log('[Edit Mode] Cover preview:', coverUrl);
      }
      
      // Load video links if exists
      if (business.videos) {
        const videosData = typeof business.videos === 'string' 
          ? JSON.parse(business.videos) 
          : business.videos;
        setVideoLinks(videosData || []);
      }
      
    } catch (error) {
      console.error('Failed to fetch business:', error);
      toast.error('Failed to load business data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const toastId = toast.loading('Submitting your business...');
    try {
      const submitData = {
        ...formData,
        // logo and cover_image now contain URLs from backend upload
        services: JSON.stringify(services),
        opening_hours: JSON.stringify(openingHours),
        social_links: JSON.stringify(socialLinks),
        gallery: JSON.stringify(galleryPhotos || []),
        videos: null,
      };

      console.log('[handleSubmit] Submit data:', submitData);
      console.log('[handleSubmit] Logo:', submitData.logo);
      console.log('[handleSubmit] Cover:', submitData.cover_image);

      if (isEditMode) {
        await userBusinessApi.update(Number(editId), submitData);
        toast.success('Business updated successfully!', { id: toastId });
      } else {
        await userBusinessApi.create(submitData);
        toast.success('Business submitted successfully! Pending approval.', { id: toastId });
        
        // Clear localStorage after successful submission
        localStorage.removeItem('addBusinessFormData');
        localStorage.removeItem('addBusinessServices');
        localStorage.removeItem('addBusinessOpeningHours');
        localStorage.removeItem('addBusinessSocialLinks');
        localStorage.removeItem('addBusinessCurrentStep');
        localStorage.removeItem('addBusinessSecondaryCategories');
        localStorage.removeItem('addBusinessGalleryPhotos');
      }
      router.push('/dashboard/businesses');
    } catch (error: any) {
      console.error('Submit error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save business';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async () => {
    const toastId = toast.loading('Saving draft...');
    try {
      const draftData = {
        ...formData,
        name: formData.name || 'Untitled Business',
        category_id: formData.category_id || categories[0]?.id || 1,
        area_id: formData.area_id || areas[0]?.id || 1,
        address: formData.address || 'Patna',
        logo: '', // Don't save base64 in draft
        cover_image: '', // Don't save base64 in draft
        services: JSON.stringify(services),
        opening_hours: JSON.stringify(openingHours),
        social_links: JSON.stringify(socialLinks),
      };
      await userBusinessApi.saveDraft(draftData);
      toast.success('Draft saved successfully!', { id: toastId });
    } catch (error: any) {
      console.error('Save draft error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save draft';
      toast.error(errorMessage, { id: toastId });
    }
  };

  // Clear form and localStorage
  const clearForm = () => {
    if (confirm('Are you sure you want to clear all form data? This cannot be undone.')) {
      // Clear localStorage
      localStorage.removeItem('addBusinessFormData');
      localStorage.removeItem('addBusinessServices');
      localStorage.removeItem('addBusinessOpeningHours');
      localStorage.removeItem('addBusinessSocialLinks');
      localStorage.removeItem('addBusinessCurrentStep');
      localStorage.removeItem('addBusinessSecondaryCategories');
      localStorage.removeItem('addBusinessGalleryPhotos');
      
      // Reset form data
      setFormData({
        name: '',
        category_id: '',
        tagline: '',
        short_description: '',
        description: '',
        established_year: new Date().getFullYear().toString(),
        logo: '',
        cover_image: '',
        phone: '',
        alternate_phone: '',
        email: '',
        website: '',
        whatsapp: '',
        inquiry_email: '',
        inquiry_preference: 'email',
        address: '',
        address_line2: '',
        city: 'Patna',
        state: 'Bihar',
        pincode: '',
        country: 'India',
        landmark: '',
        latitude: '',
        longitude: '',
        google_map_location: '',
        area_id: '',
      });
      
      // Reset other states
      setServices([]);
      setOpeningHours({
        monday: { is_open: true, open_time: '09:00', close_time: '18:00' },
        tuesday: { is_open: true, open_time: '09:00', close_time: '18:00' },
        wednesday: { is_open: true, open_time: '09:00', close_time: '18:00' },
        thursday: { is_open: true, open_time: '09:00', close_time: '18:00' },
        friday: { is_open: true, open_time: '09:00', close_time: '18:00' },
        saturday: { is_open: true, open_time: '09:00', close_time: '18:00' },
        sunday: { is_open: false, open_time: '09:00', close_time: '18:00' },
      });
      setSocialLinks({
        facebook: { enabled: false, url: '' },
        instagram: { enabled: false, url: '' },
        twitter: { enabled: false, url: '' },
        linkedin: { enabled: false, url: '' },
        youtube: { enabled: false, url: '' },
        whatsapp_business: { enabled: false, url: '' },
        pinterest: { enabled: false, url: '' },
        other: { enabled: false, url: '' },
      });
      setSecondaryCategories([]);
      setGalleryPhotos([]);
      setLogoPreview('');
      setCoverPreview('');
      setCurrentStep(1);
      
      toast.success('Form cleared successfully!');
    }
  };

  // Image upload handlers
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size should be less than 2MB');
        return;
      }
      
      const toastId = toast.loading('Uploading logo...');
      
      // Create preview and upload to backend
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        setLogoPreview(result);
        
        try {
          // Upload to backend
          const uploadResponse = await userBusinessApi.uploadImageBase64(result, 'logo');
          
          if (uploadResponse.success) {
            setFormData({ ...formData, logo: uploadResponse.url });
            toast.success('Logo uploaded successfully!', { id: toastId });
          } else {
            toast.error('Failed to upload logo', { id: toastId });
          }
        } catch (error) {
          console.error('Logo upload error:', error);
          toast.error('Failed to upload logo', { id: toastId });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      
      const toastId = toast.loading('Uploading cover image...');
      
      // Create preview and upload to backend
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        setCoverPreview(result);
        
        try {
          // Upload to backend
          const uploadResponse = await userBusinessApi.uploadImageBase64(result, 'cover');
          
          if (uploadResponse.success) {
            setFormData({ ...formData, cover_image: uploadResponse.url });
            toast.success('Cover image uploaded successfully!', { id: toastId });
          } else {
            toast.error('Failed to upload cover image', { id: toastId });
          }
        } catch (error) {
          console.error('Cover upload error:', error);
          toast.error('Failed to upload cover image', { id: toastId });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Secondary category handlers
  const toggleSecondaryCategory = (categoryId: number) => {
    if (secondaryCategories.includes(categoryId)) {
      setSecondaryCategories(secondaryCategories.filter(id => id !== categoryId));
    } else {
      setSecondaryCategories([...secondaryCategories, categoryId]);
    }
  };

  // Service handlers
  const addService = () => {
    if (services.length >= 10) {
      toast.error('Maximum 10 services allowed. Please remove a service before adding a new one.');
      return;
    }
    setServices([...services, {
      id: Date.now(),
      name: '',
      description: '',
      price: '',
      active: true
    }]);
    toast.success('New service added');
  };

  const updateService = (id: number, field: string, value: any) => {
    setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeService = (id: number) => {
    setServices(services.filter(s => s.id !== id));
  };

  // Opening hours handler
  const updateOpeningHours = (day: string, field: string, value: any) => {
    setOpeningHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  // Social links handler
  const updateSocialLink = (platform: string, field: string, value: any) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: { ...prev[platform], [field]: value }
    }));
  };

  const wordCount = (formData.short_description || '').split(' ').filter(w => w).length;
  const descWordCount = (formData.description || '').split(' ').filter(w => w).length;

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const steps = [
    { id: 1, title: 'Details', subtitle: 'Basic Information' },
    { id: 2, title: 'Contact', subtitle: 'Phone, Email, Website' },
    { id: 3, title: 'Location', subtitle: 'Address & Map' },
    { id: 4, title: 'Hours', subtitle: 'Business Hours' },
    { id: 5, title: 'Services', subtitle: 'Products & Services' },
    { id: 6, title: 'Photos', subtitle: 'Images & Videos' },
    { id: 7, title: 'Social Links', subtitle: 'Social Media Links' },
  ];

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            fontSize: '14px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <DashboardLayout
        pageTitle={isEditMode ? 'Edit Business Listing' : 'Add New Business'}
        pageSubtitle="Update your business information and details"
        showSaveButton={true}
        onSaveClick={currentStep === totalSteps ? handleSubmit : () => setCurrentStep(currentStep + 1)}
        saveButtonText={loading ? 'Saving...' : 'Save & Continue'}
        loading={loading}
      >
      {/* Main Content without fixed header - handled by layout */}
      <div className="p-3 sm:p-6">
        {/* Steps Progress Bar */}
        <div className="bg-white border border-gray-200 rounded-lg px-3 sm:px-6 py-4 sm:py-5 mb-4 sm:mb-6">
          <div className="flex items-center justify-between max-w-6xl mx-auto relative overflow-x-auto scrollbar-hide gap-2 sm:gap-0">
            {/* Background Line */}
            <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200 hidden sm:block" style={{ zIndex: 0 }}></div>

            {steps.map((step, index) => (
              <div
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className="flex flex-col items-center cursor-pointer relative"
                style={{ zIndex: 1 }}
              >
                {/* Circle with Icon/Number */}
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all mb-1 sm:mb-2 ${currentStep === step.id
                    ? 'bg-orange-500 text-white shadow-lg scale-110'
                    : currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-400 border-2 border-gray-300'
                  }`}>
                  {step.id === 1 && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path></svg>}
                  {step.id === 2 && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>}
                  {step.id === 3 && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>}
                  {step.id === 4 && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path></svg>}
                  {step.id === 5 && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path></svg>}
                  {step.id === 6 && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path></svg>}
                  {step.id === 7 && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"></path></svg>}
                </div>

                {/* Step Label */}
                <div className="text-center">
                  <p className={`text-xs font-semibold whitespace-nowrap ${currentStep === step.id ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400 whitespace-nowrap hidden sm:block">{step.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <main className="p-3 sm:p-6">
          {/* STEP 1: Business Details */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 max-w-7xl mx-auto">
              <div className="col-span-full lg:col-span-8">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Business Details</h2>
                  <p className="text-sm text-gray-500">Tell customers about your business</p>
                </div>

                {/* White Card Body */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6">
                    {/* Left: Form Fields */}
                    <div className="col-span-full sm:col-span-7 space-y-4">
                      {/* Business Name & Category - Same Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name *</label>
                          <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="ABC Digital Solutions" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Category *</label>
                          <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white">
                            <option value="">Select a category</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                          </select>
                          <button 
                            type="button" 
                            onClick={() => setShowSecondaryModal(true)}
                            className="text-orange-500 text-xs mt-1.5 font-medium flex items-center gap-1 hover:text-orange-600"
                          >
                            <span>+</span> Add Secondary Category
                          </button>
                          {/* Display selected secondary categories */}
                          {secondaryCategories.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {secondaryCategories.map(catId => {
                                const category = categories.find(c => c.id === catId);
                                return category ? (
                                  <span 
                                    key={catId}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs"
                                  >
                                    {category.name}
                                    <button
                                      type="button"
                                      onClick={() => setSecondaryCategories(secondaryCategories.filter(id => id !== catId))}
                                      className="hover:text-orange-900"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </span>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tagline & Established Year - Same Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Tagline</label>
                          <input type="text" value={formData.tagline} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Your Growth, Our Strategy" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Established Year</label>
                          <input type="number" value={formData.established_year} onChange={(e) => setFormData({ ...formData, established_year: e.target.value })} className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="2020" />
                        </div>
                      </div>


                      {/* Short Description - Full Width */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Description *</label>
                        <p className="text-xs text-gray-500 mb-2">A short summary about your business (shown in listing)</p>
                        <textarea value={formData.short_description} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} rows={3} className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="We provide result-driven digital marketing services to help businesses grow online." />
                        <div className="flex items-center justify-end mt-1">
                          <p className="text-xs text-gray-400">{wordCount}/150</p>
                        </div>
                      </div>

                      {/* Business Description - Full Width */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Description *</label>
                        <p className="text-xs text-gray-500 mb-2">Tell customers more about your business</p>
                        <textarea 
                          value={formData.description} 
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                          rows={8} 
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                          placeholder="ABC Digital Solutions is a full-service digital marketing agency based in Patna. We specialize in SEO, Social Media Marketing, Google Ads, Content Marketing, Website Development and more. Our mission is to help businesses establish a strong online presence and achieve measurable growth." 
                        />
                        <div className="flex items-center justify-end mt-1">
                          <p className="text-xs text-gray-400">{descWordCount}/1000</p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Logo & Cover Image */}
                    <div className="col-span-full sm:col-span-5 space-y-5">
                      {/* Business Logo */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Logo *</label>
                        <p className="text-xs text-gray-500 mb-3">Upload your business logo</p>
                        <input 
                          type="file" 
                          id="logo-upload" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleLogoUpload}
                        />
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 cursor-pointer bg-gray-50 transition">
                          <div className="w-24 h-24 mx-auto bg-white border border-gray-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                            {logoPreview || formData.logo ? (
                              <img 
                                src={logoPreview || getImageUrl(formData.logo)} 
                                alt="Logo Preview" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center">
                                <div className="text-3xl font-bold text-gray-400">
                                  {formData.name ? formData.name.substring(0, 2).toUpperCase() : 'AB'}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">LOGO</p>
                              </div>
                            )}
                          </div>
                          <button 
                            type="button"
                            onClick={() => document.getElementById('logo-upload')?.click()}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-white bg-gray-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 1 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Upload New Logo
                          </button>
                          <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 2MB</p>
                        </div>
                      </div>

                      {/* Cover Image */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Cover Image *</label>
                        <p className="text-xs text-gray-500 mb-3">Upload a cover photo for your business listing</p>
                        <input 
                          type="file" 
                          id="cover-upload" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleCoverUpload}
                        />
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-orange-500 cursor-pointer bg-gray-50 transition">
                          <div className="w-full h-40 bg-white rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-gray-200">
                            {coverPreview || formData.cover_image ? (
                              <img 
                                src={coverPreview || getImageUrl(formData.cover_image)} 
                                alt="Cover Preview" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center text-gray-400">
                                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-sm">1200 x 400 px</p>
                              </div>
                            )}
                          </div>
                          <button 
                            type="button"
                            onClick={() => document.getElementById('cover-upload')?.click()}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-white bg-gray-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Upload New Image
                          </button>
                          <p className="text-xs text-gray-400 mt-2 text-center">PNG, JPG up to 5MB</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Navigation Buttons - Inside Card */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-200">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <button onClick={saveDraft} className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition bg-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Save Draft
                      </button>
                      <button onClick={clearForm} className="flex items-center gap-2 px-5 py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition bg-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Clear Form
                      </button>
                    </div>
                    <button onClick={() => setCurrentStep(2)} className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition shadow-sm">
                      Save & Continue
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Preview */}
              <BusinessPreview />
            </div>
          )}

          {/* STEP 2: Contact Information */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 max-w-7xl mx-auto">
              <div className="col-span-full lg:col-span-8">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Contact Information</h2>
                  <p className="text-sm text-gray-500">Add ways for customers to contact you</p>
                </div>

                {/* White Card Body */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="space-y-5">
                    {/* Phone Number & Alternative Phone - Same Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
                        <div className="flex gap-2">
                          <div className="relative w-24">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                              🇮🇳
                            </div>
                            <select className="w-full pl-10 pr-2 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white appearance-none">
                              <option>+91</option>
                            </select>
                          </div>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="98765 43210"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Alternative Phone (Optional)</label>
                        <div className="flex gap-2">
                          <div className="relative w-24">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                              🇮🇳
                            </div>
                            <select className="w-full pl-10 pr-2 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white appearance-none">
                              <option>+91</option>
                            </select>
                          </div>
                          <input
                            type="tel"
                            value={formData.alternate_phone}
                            onChange={(e) => setFormData({ ...formData, alternate_phone: e.target.value })}
                            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="91234 56789"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email & Website - Same Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="info@abcdigitalsolutions.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Website (Optional)</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                          </div>
                          <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="https://www.abcdigitalsolutions.com"
                          />
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp Number - Full Width */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp Number (Optional)</label>
                      <div className="flex gap-2">
                        <div className="relative w-24">
                          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                          </div>
                          <select className="w-full pl-10 pr-2 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white appearance-none">
                            <option>+91</option>
                          </select>
                        </div>
                        <input
                          type="tel"
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="98765 43210"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5">This number will be shown as WhatsApp click-to-chat button</p>
                    </div>

                    {/* Inquiry / Contact Form Email - Full Width */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Inquiry / Contact Form Email (Optional)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          value={formData.inquiry_email}
                          onChange={(e) => setFormData({ ...formData, inquiry_email: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="inquiries@abcdigitalsolutions.com"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5">If different from above email. Leave blank to use the email above.</p>
                    </div>

                    {/* Business Communication Preference */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Communication Preference</label>
                      <p className="text-xs text-gray-500 mb-4">Choose how you prefer to receive inquiries from customers.</p>
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        {/* Email Option */}
                        <div
                          onClick={() => setFormData({ ...formData, inquiry_preference: 'email' })}
                          className={`relative p-5 border-2 rounded-lg cursor-pointer transition-all ${formData.inquiry_preference === 'email'
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <div className="absolute top-3 right-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.inquiry_preference === 'email'
                                ? 'border-orange-500 bg-orange-500'
                                : 'border-gray-300'
                              }`}>
                              {formData.inquiry_preference === 'email' && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                              <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <h4 className="font-semibold text-sm text-gray-900 mb-1">Email</h4>
                            <p className="text-xs text-gray-500">Receive inquiries on email</p>
                          </div>
                        </div>

                        {/* Phone Call Option */}
                        <div
                          onClick={() => setFormData({ ...formData, inquiry_preference: 'phone' })}
                          className={`relative p-5 border-2 rounded-lg cursor-pointer transition-all ${formData.inquiry_preference === 'phone'
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <div className="absolute top-3 right-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.inquiry_preference === 'phone'
                                ? 'border-orange-500 bg-orange-500'
                                : 'border-gray-300'
                              }`}>
                              {formData.inquiry_preference === 'phone' && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </div>
                            <h4 className="font-semibold text-sm text-gray-900 mb-1">Phone Call</h4>
                            <p className="text-xs text-gray-500">Receive inquiries on phone</p>
                          </div>
                        </div>

                        {/* WhatsApp Option */}
                        <div
                          onClick={() => setFormData({ ...formData, inquiry_preference: 'whatsapp' })}
                          className={`relative p-5 border-2 rounded-lg cursor-pointer transition-all ${formData.inquiry_preference === 'whatsapp'
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <div className="absolute top-3 right-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.inquiry_preference === 'whatsapp'
                                ? 'border-orange-500 bg-orange-500'
                                : 'border-gray-300'
                              }`}>
                              {formData.inquiry_preference === 'whatsapp' && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3">
                              <svg className="w-7 h-7 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                              </svg>
                            </div>
                            <h4 className="font-semibold text-sm text-gray-900 mb-1">WhatsApp</h4>
                            <p className="text-xs text-gray-500">Receive inquiries on WhatsApp</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Navigation Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-200">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <button onClick={() => setCurrentStep(1)} className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition bg-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                      </button>
                      <button onClick={clearForm} className="flex items-center gap-2 px-5 py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition bg-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Clear Form
                      </button>
                    </div>
                    <button onClick={() => setCurrentStep(3)} className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition shadow-sm">
                      Save & Continue
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Preview */}
              <BusinessPreview />
            </div>
          )}

          {/* STEP 3: Location */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 max-w-7xl mx-auto">
              <div className="col-span-full lg:col-span-8">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Business Location</h2>
                  <p className="text-sm text-gray-500">Help customers find you by adding accurate location details.</p>
                </div>

                {/* White Card Body */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6">
                    {/* Left: Form Fields */}
                    <div className="col-span-full sm:col-span-6 space-y-4">
                      {/* Address Line 1 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 1 *</label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Boring Road, Near Patna Junction"
                        />
                      </div>

                      {/* Address Line 2 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 2 (Optional)</label>
                        <input
                          type="text"
                          value={formData.address_line2}
                          onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Opp. Panchmukhii Hanuman Mandir"
                        />
                      </div>

                      {/* Area/Locality & Landmark */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Area / Locality *</label>
                          <select
                            value={formData.area_id}
                            onChange={(e) => setFormData({ ...formData, area_id: e.target.value })}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                          >
                            <option value="">Select an area</option>
                            {areas.map(area => <option key={area.id} value={area.id}>{area.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Landmark (Optional)</label>
                          <input
                            type="text"
                            value={formData.landmark}
                            onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Near Axis Bank"
                          />
                        </div>
                      </div>

                      {/* City / Town & State */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">City / Town *</label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Patna"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">State *</label>
                          <select
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                          >
                            <option value="Bihar">Bihar</option>
                            <option value="Delhi">Delhi</option>
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Karnataka">Karnataka</option>
                          </select>
                        </div>
                      </div>

                      {/* Pincode & Country */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode *</label>
                          <input
                            type="text"
                            value={formData.pincode}
                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="800001"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Country *</label>
                          <select
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                          >
                            <option value="India">India</option>
                          </select>
                        </div>
                      </div>

                      {/* Latitude & Longitude */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Latitude (Optional)</label>
                          <input
                            type="text"
                            value={formData.latitude}
                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="25.5941"
                          />
                          <p className="text-xs text-gray-500 mt-1">Auto-filled from map pin</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Longitude (Optional)</label>
                          <input
                            type="text"
                            value={formData.longitude}
                            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="85.1376"
                          />
                          <p className="text-xs text-gray-500 mt-1">Auto-filled from map pin</p>
                        </div>
                      </div>

                      {/* Google Map Location */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Google Map URL (Optional)</label>
                        <p className="text-xs text-gray-500 mb-2">Paste Google Maps share link for your business location</p>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          </div>
                          <input
                            type="url"
                            value={formData.google_map_location}
                            onChange={(e) => setFormData({ ...formData, google_map_location: e.target.value })}
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="https://maps.google.com/..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right: Map */}
                    <div className="col-span-full sm:col-span-6">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Location Map Preview</label>
                        <p className="text-xs text-gray-500">Preview of your business location</p>
                      </div>
                      
                      <div className="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-300" style={{ height: '350px' }}>
                        {(() => {
                          const hasLatLng = formData.latitude && formData.longitude;
                          const hasAddress = formData.address || formData.city;
                          const hasMapUrl = formData.google_map_location;
                          const mapQuery = (() => {
                            if (hasMapUrl) {
                              try {
                                const url = new URL(hasMapUrl.startsWith('http') ? hasMapUrl : `https://${hasMapUrl}`);
                                const q = url.searchParams.get('q');
                                if (q) return q;
                                const ll = url.searchParams.get('ll');
                                if (ll) return ll;
                                const query = url.searchParams.get('query');
                                if (query) return query;
                              } catch {
                                if (/^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/.test(hasMapUrl.trim())) return hasMapUrl.trim();
                                return hasMapUrl;
                              }
                            }
                            if (hasLatLng) return `${formData.latitude},${formData.longitude}`;
                            if (hasAddress) return [formData.address, formData.landmark, formData.city, formData.state, formData.pincode].filter(Boolean).join(', ');
                            return '';
                          })();

                          return mapQuery ? (
                            <iframe
                              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                              className="w-full h-full"
                              style={{ border: 0 }}
                              loading="lazy"
                              title="Business Location Map"
                            />
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                              <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <p className="text-sm font-medium mb-1">No Map Location</p>
                              <p className="text-xs">Add address or coordinates to preview</p>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Address Tips */}
                      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <h4 className="font-bold text-sm text-gray-900 mb-1">How to get Google Maps link?</h4>
                            <ul className="text-xs text-gray-600 space-y-1">
                              <li>1. Open Google Maps and find your location</li>
                              <li>2. Click "Share" button</li>
                              <li>3. Copy the link and paste above</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Current Location Summary */}
                      {(formData.address || formData.city) && (
                        <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                              <h4 className="font-bold text-sm text-green-900 mb-1">Current Address</h4>
                              <p className="text-xs text-green-700">
                                {formData.address && <span>{formData.address}</span>}
                                {formData.address_line2 && <span>, {formData.address_line2}</span>}
                                {formData.landmark && <span>, {formData.landmark}</span>}
                                {formData.city && <span><br />{formData.city}</span>}
                                {formData.state && <span>, {formData.state}</span>}
                                {formData.pincode && <span> - {formData.pincode}</span>}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Navigation Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-200">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <button onClick={() => setCurrentStep(2)} className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition bg-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                      </button>
                      <button onClick={clearForm} className="flex items-center gap-2 px-5 py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition bg-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Clear Form
                      </button>
                    </div>
                    <button onClick={() => setCurrentStep(4)} className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition shadow-sm">
                      Save & Continue
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Preview */}
              <BusinessPreview />
            
            </div>
          )}

          

{/* STEP 4: Business Hours */ }
{
  currentStep === 4 && (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 max-w-7xl mx-auto">
      <div className="col-span-full lg:col-span-8">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">Business Hours</h2>
          <p className="text-sm text-gray-500">Set your operating hours for customers</p>
        </div>

        {/* White Card Body */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="space-y-3">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
              <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
                <div className="sm:w-28 shrink-0">
                  <p className="text-sm font-semibold text-gray-900 capitalize">{day}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1">
                  <input
                    type="time"
                    value={openingHours[day].open_time}
                    onChange={(e) => updateOpeningHours(day, 'open_time', e.target.value)}
                    disabled={!openingHours[day].is_open}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <span className="text-gray-400 font-medium">to</span>
                  <input
                    type="time"
                    value={openingHours[day].close_time}
                    onChange={(e) => updateOpeningHours(day, 'close_time', e.target.value)}
                    disabled={!openingHours[day].is_open}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  
                  {/* Copy to All Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const currentDayHours = openingHours[day];
                      const newHours = { ...openingHours };
                      Object.keys(newHours).forEach(d => {
                        newHours[d] = { ...currentDayHours };
                      });
                      setOpeningHours(newHours);
                    }}
                    className="px-3 py-2 text-xs border border-gray-300 rounded-md hover:bg-white hover:border-orange-500 hover:text-orange-600 transition whitespace-nowrap"
                    title="Copy these hours to all days"
                  >
                    <svg className="w-4 h-4 inline sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="hidden sm:inline">Copy to All</span>
                  </button>
                </div>
                <label className="flex items-center gap-2 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={openingHours[day].is_open}
                    onChange={(e) => updateOpeningHours(day, 'is_open', e.target.checked)}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                  />
                  <span className={`text-sm font-medium ${openingHours[day].is_open ? 'text-green-600' : 'text-red-600'}`}>
                    {openingHours[day].is_open ? 'Open' : 'Closed'}
                  </span>
                </label>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-5">
            <button
              onClick={() => {
                const newHours = { ...openingHours };
                Object.keys(newHours).forEach(day => newHours[day].is_open = true);
                setOpeningHours(newHours);
              }}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
            >
              Open All Days
            </button>
            <button
              onClick={() => {
                const newHours = { ...openingHours };
                ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].forEach(day => {
                  newHours[day] = { is_open: true, open_time: '09:00', close_time: '18:00' };
                });
                newHours.sunday = { is_open: false, open_time: '09:00', close_time: '18:00' };
                setOpeningHours(newHours);
              }}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
            >
              Standard Hours (9AM-6PM)
            </button>
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentStep(3)} className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition bg-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <button onClick={clearForm} className="flex items-center gap-2 px-5 py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition bg-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Form
              </button>
            </div>
            <button onClick={() => setCurrentStep(5)} className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition shadow-sm">
              Save & Continue
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Right: Preview */}
      <BusinessPreview />
            </div>
          )}

          {/* STEP 5: Services */}
          {currentStep === 5 && (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 max-w-7xl mx-auto">
      <div className="col-span-full lg:col-span-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Services & Products</h2>
            <p className="text-sm text-gray-500">
              Add the services or products you offer. 
              <span className={`ml-1 font-semibold ${services.length >= 10 ? 'text-red-600' : 'text-gray-700'}`}>
                ({services.length}/10)
              </span>
            </p>
          </div>
          <button 
            onClick={addService} 
            disabled={services.length >= 10}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition ${
              services.length >= 10 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {services.length >= 10 ? 'Maximum Reached' : 'Add New Service'}
          </button>
        </div>

        {/* White Card Body */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          {services.length > 0 ? (
            <>
              <div className="space-y-3">
                {services.map((service, index) => (
                  <div key={service.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-center gap-4">
                      {/* Drag Handle */}
                      <div className="cursor-move text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h4m0 0V4m0 4l-4 4m16-4h-4m0 0V4m0 4l4 4M4 16h4m0 0v4m0-4l-4-4m16 4h-4m0 0v4m0-4l4-4" />
                        </svg>
                      </div>

                      {/* Icon */}
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {index === 0 && (
                          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                        {index === 1 && (
                          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        )}
                        {index === 2 && (
                          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                          </svg>
                        )}
                        {index === 3 && (
                          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        )}
                        {index > 3 && (
                          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>

                      {/* Service Details */}
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={service.name}
                          onChange={(e) => updateService(service.id, 'name', e.target.value)}
                          className="text-base font-semibold text-gray-900 mb-1 w-full border-0 border-b border-transparent hover:border-gray-300 focus:border-orange-500 focus:ring-0 px-0"
                          placeholder="Digital Marketing"
                        />
                        <textarea
                          value={service.description}
                          onChange={(e) => updateService(service.id, 'description', e.target.value)}
                          rows={1}
                          className="text-sm text-gray-600 w-full border-0 border-b border-transparent hover:border-gray-300 focus:border-orange-500 focus:ring-0 px-0 resize-none"
                          placeholder="SEO, Social Media Marketing, Google Ads, Content Marketing to grow your online presence."
                        />
                      </div>

                      {/* Price */}
                      <div className="text-right min-w-[120px]">
                        <p className="text-xs text-gray-500 mb-1">Price</p>
                        <input
                          type="text"
                          value={service.price}
                          onChange={(e) => updateService(service.id, 'price', e.target.value)}
                          className="text-base font-semibold text-gray-900 text-right w-full border-0 border-b border-transparent hover:border-gray-300 focus:border-orange-500 focus:ring-0 px-0"
                          placeholder="₹ 15,000"
                        />
                        <p className="text-xs text-gray-500 mt-1">/ Monthly</p>
                      </div>

                      {/* Toggle Switch */}
                      <div className="flex flex-col items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={service.active}
                            onChange={(e) => updateService(service.id, 'active', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                        <span className="text-xs font-medium text-gray-600">{service.active ? 'Active' : 'Inactive'}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        <button className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => removeService(service.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Maximum Limit Warning */}
              {services.length >= 10 && (
                <div className="mt-4 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p><strong>Maximum limit reached!</strong> You can add up to 10 services only. Remove a service to add a new one.</p>
                </div>
              )}

              {/* Drag Instruction */}
              <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p>Drag and drop services to reorder them. Use the toggle to show or hide a service.</p>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h4 className="text-sm font-bold text-gray-900">Showcase Your Services</h4>
                  </div>
                  <p className="text-xs text-gray-600">Help customers understand what you offer.</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <h4 className="text-sm font-bold text-gray-900">Boost Visibility</h4>
                  </div>
                  <p className="text-xs text-gray-600">Complete listings rank higher in search.</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h4 className="text-sm font-bold text-gray-900">Get More Leads</h4>
                  </div>
                  <p className="text-xs text-gray-600">Clear services bring more inquiries.</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <p className="text-gray-500 text-base font-medium mb-2">No services added yet</p>
              <p className="text-gray-400 text-sm mb-4">Add services to showcase what you offer to customers</p>
              <button onClick={addService} className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Your First Service
              </button>
            </div>
          )}

          {/* Bottom Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentStep(4)} className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition bg-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <button onClick={clearForm} className="flex items-center gap-2 px-5 py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition bg-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Form
              </button>
            </div>
            <button onClick={() => setCurrentStep(6)} className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition shadow-sm">
              Save & Continue
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Right: Preview */}
      <BusinessPreview />
            </div>
          )}

          {/* STEP 6: Photos & Videos */}
          {currentStep === 6 && (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 max-w-7xl mx-auto">
      <div className="col-span-full lg:col-span-8">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">Photos & Videos</h2>
          <p className="text-sm text-gray-500">Add high quality photos to showcase your business and attract more customers.</p>
        </div>

        {/* White Card Body */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="space-y-6">
            {/* Info Message */}
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-blue-900">High quality images get more views and more trust from customers. Add at least 5 photos.</p>
            </div>

            {/* Cover Photo from Step 1 */}
            {(coverPreview || formData.cover_image) && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-900">Cover Photo <span className="text-gray-500 font-normal text-xs">(Set in Step 1)</span></label>
                  <button 
                    type="button" 
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Change in Step 1
                  </button>
                </div>
                <div className="relative rounded-lg overflow-hidden border border-gray-300 bg-gray-100">
                  <img
                    src={coverPreview || getImageUrl(formData.cover_image)}
                    alt="Cover"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded">Current Cover</span>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Area */}
            <div>
              <label className="text-sm font-semibold text-gray-900 mb-3 block">Add Gallery Photos</label>
              <input 
                type="file" 
                id="gallery-upload" 
                accept="image/*" 
                multiple
                className="hidden" 
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length === 0) return;

                  const toastId = toast.loading(`Uploading ${files.length} photo${files.length > 1 ? 's' : ''}...`);
                  let uploadedCount = 0;
                  const uploadedUrls: string[] = [];

                  for (const file of files) {
                    if (!file.type.startsWith('image/')) {
                      toast.error(`${file.name} is not an image file`);
                      continue;
                    }
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error(`${file.name} is too large (max 5MB)`);
                      continue;
                    }

                    try {
                      const reader = new FileReader();
                      const base64 = await new Promise<string>((resolve) => {
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.readAsDataURL(file);
                      });

                      // Upload to backend
                      const uploadResponse = await userBusinessApi.uploadImageBase64(base64, 'gallery');
                      if (uploadResponse.success) {
                        uploadedUrls.push(uploadResponse.url);
                        uploadedCount++;
                      }
                    } catch (error) {
                      console.error(`Failed to upload ${file.name}:`, error);
                    }
                  }

                  if (uploadedCount > 0) {
                    setGalleryPhotos(prev => [...prev, ...uploadedUrls]);
                    toast.success(`${uploadedCount} photo${uploadedCount > 1 ? 's' : ''} uploaded successfully!`, { id: toastId });
                  } else {
                    toast.error('Failed to upload photos', { id: toastId });
                  }
                  
                  e.target.value = '';
                }}
              />
              <div 
                onClick={() => document.getElementById('gallery-upload')?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 cursor-pointer bg-gray-50 transition"
              >
                <svg className="w-16 h-16 text-orange-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Click to upload photos</h3>
                <p className="text-sm text-gray-500 mb-1">JPG, PNG, WebP up to 5MB each</p>
                <p className="text-xs text-gray-400">You can select multiple photos at once</p>
              </div>
            </div>

            {/* Gallery Photos Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-900">
                  Gallery Photos 
                  <span className="text-gray-500 font-normal text-xs ml-2">
                    {galleryPhotos.length}/20 photos added
                  </span>
                </label>
                {galleryPhotos.length > 0 && (
                  <button 
                    type="button" 
                    onClick={() => {
                      if (confirm('Remove all photos?')) {
                        setGalleryPhotos([]);
                      }
                    }}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              {galleryPhotos.length > 0 ? (
                <div className="grid grid-cols-4 gap-3">
                  {galleryPhotos.map((photo, index) => {
                    // Construct proper image URL
                    const imageUrl = photo.startsWith('http') 
                      ? photo 
                      : photo.startsWith('/storage/') 
                        ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000'}${photo}`
                        : photo;
                    
                    return (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-300 bg-gray-100 group hover:shadow-md transition">
                        <img
                          src={imageUrl}
                          alt={`Gallery photo ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Failed to load gallery image:', imageUrl);
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center">
                          <button 
                            type="button"
                            onClick={() => {
                              if (confirm('Delete this photo?')) {
                                setGalleryPhotos(prev => prev.filter((_, i) => i !== index));
                                toast.success('Photo removed');
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-lg shadow-lg hover:bg-red-50 transition"
                          >
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded">
                          {index + 1}
                        </div>
                      </div>
                    );
                  })}
                  {galleryPhotos.length < 20 && (
                    <div 
                      onClick={() => document.getElementById('gallery-upload')?.click()}
                      className="aspect-square w-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition border-2 border-dashed border-gray-300 rounded-lg"
                    >
                      <svg className="w-10 h-10 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <p className="text-xs text-gray-500 font-medium text-center">Add More</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500 text-base font-medium mb-2">No photos added yet</p>
                  <p className="text-gray-400 text-sm mb-4">Click the upload area above to add photos</p>
                </div>
              )}
            </div>

            {/* Photo Guidelines */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Photo Tips for Better Results
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">Use clear, high-resolution photos</p>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">Show your storefront & interior</p>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">Include products & services</p>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">Showcase your team at work</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentStep(5)} className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition bg-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <button onClick={clearForm} className="flex items-center gap-2 px-5 py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition bg-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Form
              </button>
            </div>
            <button onClick={() => setCurrentStep(7)} className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition shadow-sm">
              Save & Continue
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Right: Preview */}
      <BusinessPreview />
            </div>
          )}

          {/* STEP 7: Social Links */}
          {currentStep === 7 && (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 max-w-7xl mx-auto">
      <div className="col-span-full lg:col-span-8">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">Social Media & Website Links</h2>
          <p className="text-sm text-gray-500">Add your social media profiles and other important links to connect with your customers.</p>
        </div>

        {/* White Card Body */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          {/* Top Info Message */}
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-blue-900">Add ur social links helps customers connect with you on their preferred platforms.</p>
          </div>

          {/* Social Media Links */}
          <div className="space-y-3">
            {[
              { key: 'facebook', label: 'Facebook', placeholder: 'https://www.facebook.com/abcdigitalsolutions', color: 'bg-blue-600' },
              { key: 'instagram', label: 'Instagram', placeholder: 'https://www.instagram.com/abc_digital_solutions', color: 'bg-pink-600' },
              { key: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/ABCDigitals', color: 'bg-black' },
              { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://www.linkedin.com/company/abcdigitalsolutions', color: 'bg-blue-700' },
              { key: 'youtube', label: 'YouTube', placeholder: 'https://www.youtube.com/@abcdigitalsolutions', color: 'bg-red-600' },
              { key: 'whatsapp_business', label: 'WhatsApp', placeholder: 'https://wa.me/919876543210', color: 'bg-green-600' },
              { key: 'pinterest', label: 'Pinterest (Optional)', placeholder: 'https://in.pinterest.com/yourprofile', color: 'bg-red-500' },
              { key: 'other', label: 'Other Website (Optional)', placeholder: 'https://abcdigitalsolutions.com/blog', color: 'bg-purple-600' },
            ].map((platform) => (
              <div key={platform.key} className="bg-white border border-gray-300 rounded-lg p-4 hover:border-gray-400 transition">
                <div className="flex items-center gap-4">
                  {/* Platform Icon */}
                  <div className={`w-10 h-10 ${platform.color} rounded flex items-center justify-center flex-shrink-0`}>
                    {platform.key === 'facebook' && (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    )}
                    {platform.key === 'instagram' && (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    )}
                    {platform.key === 'twitter' && (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    )}
                    {platform.key === 'linkedin' && (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    )}
                    {platform.key === 'youtube' && (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    )}
                    {platform.key === 'whatsapp_business' && (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                    )}
                    {platform.key === 'pinterest' && (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.350-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                      </svg>
                    )}
                    {platform.key === 'other' && (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>

                  {/* Platform Name */}
                  <div className="flex-shrink-0 w-32">
                    <p className="text-sm font-semibold text-gray-900">{platform.label}</p>
                  </div>

                  {/* URL Input */}
                  <div className="flex-1">
                    <input
                      type="url"
                      value={socialLinks[platform.key]?.url || ''}
                      onChange={(e) => updateSocialLink(platform.key, 'url', e.target.value)}
                      disabled={!socialLinks[platform.key]?.enabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:text-gray-400"
                      placeholder={platform.placeholder}
                    />
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={socialLinks[platform.key]?.enabled || false}
                        onChange={(e) => updateSocialLink(platform.key, 'enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                    <span className="text-xs text-gray-600 w-20">Show on listing</span>
                  </div>

                  {/* Delete Icon */}
                  <button
                    type="button"
                    onClick={() => updateSocialLink(platform.key, 'url', '')}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Another Link Button */}
          <button type="button" className="text-orange-500 hover:text-orange-600 text-sm font-semibold flex items-center gap-1 mt-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Another Link
          </button>

          {/* Bottom Green Tip Box */}
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">Keep your links updated</h4>
                <p className="text-xs text-gray-600">Active links help build trust and help customers easily reach you.</p>
              </div>
            </div>
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentStep(6)} className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition bg-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <button onClick={clearForm} className="flex items-center gap-2 px-5 py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition bg-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Form
              </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition shadow-sm disabled:opacity-50"
            >
              {loading ? 'Submitting...' : isEditMode ? 'Update Business' : 'Save & Continue'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Right: Preview */}
      <BusinessPreview />
            </div>
          )}
        </main>
      </div>

      {/* Secondary Category Modal */}
      {showSecondaryModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Add Secondary Categories</h3>
            <p className="text-sm text-gray-500 mt-1">Select additional categories for your business</p>
          </div>
          <button
            onClick={() => setShowSecondaryModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories
              .filter(cat => cat.id.toString() !== formData.category_id) // Exclude primary category
              .map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleSecondaryCategory(category.id)}
                  className={`p-4 rounded-lg border-2 text-left transition ${secondaryCategories.includes(category.id)
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300 bg-white'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-gray-900">{category.name}</span>
                    {secondaryCategories.includes(category.id) && (
                      <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            {secondaryCategories.length} {secondaryCategories.length === 1 ? 'category' : 'categories'} selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowSecondaryModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white transition"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowSecondaryModal(false)}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
    </DashboardLayout>
    </>
  );
}

export default function AddBusinessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div></div>}>
      <AddBusinessPageContent />
    </Suspense>
  );
}

