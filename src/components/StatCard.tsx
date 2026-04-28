import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  to?: string;
  onClick?: () => void;
}

const StatCard = ({ title, value, icon: Icon, color = "bg-primary", to, onClick }: StatCardProps) => {
  const navigate = useNavigate();
  const clickable = !!(to || onClick);

  const handleClick = () => {
    if (onClick) onClick();
    else if (to) navigate(to);
  };

  return (
    <Card
      onClick={clickable ? handleClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(); } } : undefined}
      className={`border-0 shadow-md transition-all ${clickable ? "cursor-pointer hover:scale-[1.02] hover:shadow-lg active:scale-[0.99]" : ""}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold mt-1" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{value}</p>
          </div>
          <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
