import { Users, ShoppingBag, Globe, Star } from "lucide-react";

export const StatsSection = () => {
  const stats = [
    {
      icon: Users,
      value: "305k",
      label: "Panels created",
      color: "text-blue-400"
    },
    {
      icon: ShoppingBag,
      value: "159M",
      label: "Orders completed",
      color: "text-green-400"
    },
    {
      icon: Globe,
      value: "200+",
      label: "Payment systems",
      color: "text-purple-400"
    },
    {
      icon: Star,
      value: "20+",
      label: "Language localizations",
      color: "text-yellow-400"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            We are trusted by{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              thousands of users
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join a growing community of successful SMM panel owners who trust our platform
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-gradient-card border border-border rounded-xl p-6 text-center shadow-card hover:shadow-elegant transition-all duration-300"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold mb-2">{stat.value}</div>
              <div className="text-muted-foreground text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};