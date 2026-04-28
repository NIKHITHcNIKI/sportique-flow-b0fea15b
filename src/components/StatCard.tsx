import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  to?: string;
  onClick?: () => void;
}

const StatCard = ({ title, value, icon: Icon, color = "bg-primary", to, onClick }: StatCardProps) => {
  const card = (
    <Card className={`border-0 shadow-md transition-all ${to || onClick ? "cursor-pointer hover:scale-[1.02] hover:shadow-lg" : ""}`}>
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

  if (to) {
    return (
      <Link to={to} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        {card}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="block w-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {card}
      </button>
    );
  }

  return card;
};

export default StatCard;
