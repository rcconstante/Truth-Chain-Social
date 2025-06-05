import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";

interface Person {
  name: string;
  initials: string;
  bio: string;
  testimonial: string;
  image: string;
}

export const WhitelistedPeopleSection = (): JSX.Element => {
  const whitelistedPeople: Person[] = [
    { 
      name: "Rich Mond KO", 
      initials: "RM", 
      bio: "Blockchain Developer & Truth Advocate",
      testimonial: "Can't wait to see how this transforms social media!",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    { 
      name: "Sarah Chen", 
      initials: "SC", 
      bio: "Data Scientist & AI Researcher",
      testimonial: "This is exactly what we need for a better digital future",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    },
    { 
      name: "Alex Rivera", 
      initials: "AR", 
      bio: "Blockchain Analyst & Crypto Expert",
      testimonial: "Finally, a platform that prioritizes truth over engagement",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    { 
      name: "Emily Zhang", 
      initials: "EZ", 
      bio: "Truth Verification Specialist",
      testimonial: "Looking forward to being part of this revolution",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    },
    { 
      name: "Marcus Johnson", 
      initials: "MJ", 
      bio: "Community Builder & Social Impact",
      testimonial: "Excited to help build a more truthful internet",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
    },
    { 
      name: "Lisa Park", 
      initials: "LP", 
      bio: "Information Security Expert",
      testimonial: "This platform will change how we share information",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
    }
  ];

  const renderCard = (person: Person) => (
    <div
      key={person.initials}
      className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6 hover:border-gray-500 transition-all min-w-[300px] mx-3"
    >
      <Avatar className="w-16 h-16 mx-auto mb-4">
        <AvatarImage 
          src={person.image} 
          alt={person.name}
          className="object-cover"
        />
        <AvatarFallback className="text-white font-bold text-lg bg-gradient-to-r from-purple-500 to-pink-500">
          {person.initials}
        </AvatarFallback>
      </Avatar>
      <h3 className="text-white font-semibold text-lg mb-2 text-center">{person.name}</h3>
      <p className="text-gray-400 text-sm mb-4 text-center">{person.bio}</p>
      <p className="text-gray-300 text-sm italic text-center">"{person.testimonial}"</p>
    </div>
  );

  return (
    <section className="w-full py-16 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-bold text-white text-4xl mb-6">
            Trusted by the People
          </h2>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            Join our growing community of truth-seekers and innovators.
          </p>
        </div>

        <div className="relative">
          {/* First row - scrolling left */}
          <div className="flex animate-scroll-left whitespace-nowrap hover:animate-pause">
            <div className="flex">
              {whitelistedPeople.slice(0, 3).map(person => renderCard(person))}
            </div>
            <div className="flex">
              {whitelistedPeople.slice(0, 3).map(person => renderCard(person))}
            </div>
          </div>

          {/* Second row - scrolling right */}
          <div className="flex animate-scroll-right whitespace-nowrap mt-6 hover:animate-pause">
            <div className="flex">
              {whitelistedPeople.slice(3).map(person => renderCard(person))}
            </div>
            <div className="flex">
              {whitelistedPeople.slice(3).map(person => renderCard(person))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};