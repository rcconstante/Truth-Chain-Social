import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";

export const MainContentSection = (): JSX.Element => {
  // Data for the bullet points to enable mapping
  const misinformationIssues = [
    "No accountability for spreading false information",
    "Engagement algorithms favor sensationalism over accuracy",
    "No financial incentives for sharing verified facts",
    "Reputation systems don't prioritize truth",
  ];

  return (
    <Card className="w-full h-auto rounded-[15px] border border-white bg-black text-white">
      <CardContent className="p-7">
        <h2 className="font-bold text-xl tracking-[1.00px] text-center mb-4 font-sans">
          Misinformation Spreads Like Wildfire
        </h2>

        <p className="text-[13px] tracking-[0.65px] mb-6 font-sans">
          False information spreads 6x faster than the truth on social
          platforms. Without accountability, this epidemic continues to grow,
          affecting economies, politics, and personal lives
        </p>

        <ul className="space-y-4">
          {misinformationIssues.map((issue, index) => (
            <li key={index} className="text-[13px] tracking-[0.65px] font-sans">
              {issue}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
