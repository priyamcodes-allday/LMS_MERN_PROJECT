import uni1 from '../assets/university_logo/university1.jpg';
import uni2 from '../assets/university_logo/university2.jpg';
import uni3 from '../assets/university_logo/university3.jpg';
import uni4 from '../assets/university_logo/university4.jpg';
import uni5 from '../assets/university_logo/university5.jpg';
import uni6 from '../assets/university_logo/university6.jpg';


export default function Sponsors() {
    const logos = [
        uni1,
        uni2,
        uni3,
        uni4,
        uni5,
        uni6
    ]

  return (
    <>
      <div className="bg-white py-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-around gap-8">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">
                Trusted by students from top institutions
            </p>

            <div className='flex flex-wrap items-center justify-center gap-8 md:gap-16'>
                {logos.map((logo, index) => (
                    <div key={index} className='h-10 md:h-12 flex items-center justify-center'>
                        <img src={logo} alt={`University logo ${index + 1}`} className='h-full w-auto object-contain grayscale opacity-65 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer' />
                    </div>
                ))}
            </div>

        </div>
      </div>
    </>
  );
}
