
import React from 'react';
import { TeamCategory } from '../types';

const categories: TeamCategory[] = [
  { id: '1', name: 'Pre-benjamí', age: '4 - 6 Anys', tag: 'Escola', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYI68OHCvpUlOFSb3qu6x8FQwfFsjGGxwazf4yb6zTi-yhRVpLfop55unNS6gqekmB7XDAo1lBXHPrDVW7OvhDbe31JNATNsXRxs9RGD7jxgOBcq2xy26jPVcwIqFDbenSVLN25J4Q7NKzb5PErl5_cAoY3wEjd7qdOgpgh1rekb76wvVNx7x8xXx8Xujj3A_WOihmBqdTzv8aYxyisQhR-R2I1cyTcHhaQlvITsf7_s9IN-N55A2VUvFnPUOgpshCRsyn4B7mUpU' },
  { id: '2', name: 'Benjamí', age: '7 - 9 Anys', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnR7qOzSMDpyqMnNC4h2YbyrnX4l6B6Y45TDezVKtYAIRCWJwZLzmG64YNKDfG1WE0rhKCzc3MdWXNuxCJSKZtO7cbS_yu7TwkKr75A7-YEJbNwF4XjnCK5s_rXLz7k_3Mt-6Z2vtB-D60YVkCg_sXGdBxTjZpLM91qeJienKGAqKbgNGoEyUK0HUwQyKCPa-9Uayfsr76PPsDW6qyvLz7EPQkz1cvygsC3_sg65_zeeM78Km2IkaPNeBBOxE922PWN1ogYfJ0pS0' },
  { id: '3', name: 'Aleví', age: '10 - 11 Anys', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCRKyq5TbGFVYIyzgJFsG_24Sb6DdILJRAvMr5t646mUAnqLJYL5WqRU_WZMdOrhwGRNPrGITxTTHVT13Sw4CA3Vazc9-wIBhP6gOXi-TQPPKKZM6WiMi-q1XdVyprfRskSH5JuGEmhSA08Y75BiglazZNloWGib0sH3wWdBuUgwwnvPY8M4QbgWXaPJdCQOCtI5Il4LcYkCk4_zfdRnxL83bLjLjVMiZv_W1p3eZpLWK6On4XCCe5PHS22kxRxCmBVjAnOXjwATs' },
  { id: '4', name: 'Cadet', age: '14 - 15 Anys', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsPqtSukB-NjEXqh8qJRs3Ym_tEyW4XQoNep5xSCtqJKB7OKeuVGCLA0bKYq-KYXki5mOsshonDXSN-nkqwEOfg8HYlVPrkoBMIK6imskGBSnxegWE2tr9xAvNapygKvoa6prJKwHKXDFZa4a6p5YtRQ-yY8GJ5oMIevcWuOs9V_jO98vKzZESPMOSHERcAqSGKTDKMGtHUS7b6L-sE8jGsUBdRvNmQBnsQkGKoF_-5vfL2XL0eAfHtSx4B_wMddBFQkB_j0-Huhs' },
  { id: '5', name: 'Sènior', age: 'Amateur', tag: 'Primer Equip', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFXO84som9QnuXl0YzbwJxuxQNcM_SkCHOU7-IUi7IN4PvfAchSFAvvb65n243WpsYZCBziLNZGQBmGP1GqC_A4y2Fldjhkuhq9zLfnvO8URHOEbOARu7NToNVaBokYtcyzk5PNw1-QfAPEM4_AHdSZPxAIfE7w6dJ5k3klCqMCP6QRr9mtva2wWAru1jVuMt4TbLk2c8gWlBrBCYLjjIsN0QQM2alVJhYQ-Fc-kQYjms534ZzS6as55858a5fOe4NhYhpnOdDk_Q' }
];

const TeamsSection: React.FC = () => {
  return (
    <section className="py-20 bg-background-light dark:bg-background-dark overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="bg-primary/20 text-green-800 dark:text-primary text-xs font-bold px-3 py-1 rounded-full uppercase mb-4">Categories del Club</span>
          <h2 className="text-3xl md:text-5xl font-black dark:text-white mb-4">Els Nostres Equips</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl">Formació, passió i treball en equip des dels més petits fins al primer equip.</p>
        </div>

        <div className="flex overflow-x-auto no-scrollbar gap-6 pb-10 -mx-4 px-4 snap-x snap-mandatory">
          {categories.map((cat) => (
            <div key={cat.id} className="snap-center shrink-0 w-[300px] md:w-[320px] bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-gray-100 dark:border-white/5">
              <div className="relative aspect-[4/3] overflow-hidden">
                {cat.tag && (
                  <span className="absolute top-4 left-4 z-10 bg-primary text-background-dark text-[10px] font-bold px-2 py-1 rounded-md uppercase">{cat.tag}</span>
                )}
                <img 
                  src={cat.imageUrl} 
                  alt={cat.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div>
                  <h3 className="text-xl font-bold dark:text-white group-hover:text-primary transition-colors">{cat.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{cat.age}</p>
                </div>
                <button className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-background-dark dark:text-white font-bold text-sm group-hover:bg-primary group-hover:text-background-dark transition-all">
                  Veure Equip <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-10 flex justify-center">
          <div className="bg-primary/10 rounded-2xl p-8 md:p-12 w-full flex flex-col md:flex-row items-center justify-between gap-8 border border-primary/20">
            <div className="flex flex-col gap-3 text-center md:text-left max-w-lg">
              <h2 className="text-2xl md:text-3xl font-black dark:text-white">Uneix-te al club</h2>
              <p className="text-gray-600 dark:text-gray-400 text-base">Busquem nous talents. T'interessa formar part del CF Santpedor? Tenim lloc per a tu.</p>
            </div>
            <button className="h-12 px-8 bg-primary text-background-dark font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
              Totes les categories
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamsSection;
