import { NextResponse } from 'next/server';
import { MessagingGateway } from '@/lib/services/messaging';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const zipCode = searchParams.get('zip') || process.env.WEATHER_ZIP_CODE || '90210';
  
  const apiKey = process.env.OPENWEATHER_API_KEY;
  let temp = 88; // Default mock temperature

  if (apiKey) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode},us&units=imperial&appid=${apiKey}`
      );
      if (response.ok) {
        const data = await response.json();
        temp = data.main.temp;
      } else {
        console.error('Failed to fetch weather data:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  }

  let triggered = false;
  if (temp >= 85) {
    const gateway = new MessagingGateway();
    const adminPhone = process.env.ADMIN_PHONE_NUMBER || '5551234567';
    await gateway.sendSms(
      adminPhone,
      "It's hitting 85°F today! Is your AC ready? Reply YES for a $49 tune-up."
    );
    triggered = true;
  }

  return NextResponse.json({ temp, triggered });
}
