import React from "react";
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar";
import { Card, CardContent } from "../../../../components/ui/card";

export const TestimonialsSection = (): JSX.Element => {
  const testimonialData = {
    text: "I'm waiting for this, looking forward with this wonderfull",
    author: "Rich Mond KO",
    initials: "RM",
  };

  return (
    <Card className="w-full max-w-[404px] h-[253px] bg-[#0c0c0c] rounded-[15px] overflow-hidden border-[0.3px] border-solid border-[#ffffffb2]">
      <CardContent className="p-0 relative h-full">
        <div className="p-[22px] flex flex-col justify-between h-full">
          <p className="font-medium text-white text-sm font-['Inter',Helvetica]">
            {testimonialData.text}
          </p>

          <div className="flex items-center gap-3 mt-auto">
            <Avatar className="w-[55px] h-[55px] bg-[#d9d9d9] rounded-[27.5px]">
              <AvatarFallback className="text-black">
                {testimonialData.initials}
              </AvatarFallback>
            </Avatar>
            <span className="font-['Inter',Helvetica] font-medium text-white text-xl">
              {testimonialData.author}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
