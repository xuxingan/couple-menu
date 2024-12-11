import { useState } from 'react';
import MainLayout from '../components/MainLayout';
import Image from 'next/image';

export default function Home() {
  const [side, setSide] = useState(null);
  
  if (!side) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card w-[32rem] bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <div className="flex gap-16">
              <button 
                onClick={() => setSide('male')}
                className="group relative transform transition-all hover:scale-105 duration-300 ease-out"
              >
                <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-bili-blue 
                  group-hover:ring-8 group-hover:ring-opacity-60 transition-all duration-300
                  animate-pulse hover:animate-none shadow-lg hover:shadow-bili-blue/50">
                  <Image
                    src="/assets/images/male.jpg"
                    alt="男生头像"
                    width={160}
                    height={160}
                    className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </button>
              <button 
                onClick={() => setSide('female')}
                className="group relative transform transition-all hover:scale-105 duration-300 ease-out"
              >
                <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-bili-pink 
                  group-hover:ring-8 group-hover:ring-opacity-60 transition-all duration-300
                  animate-pulse hover:animate-none shadow-lg hover:shadow-bili-pink/50">
                  <Image
                    src="/assets/images/female.jpg"
                    alt="女生头像"
                    width={160}
                    height={160}
                    className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <MainLayout userSide={side} />;
} 