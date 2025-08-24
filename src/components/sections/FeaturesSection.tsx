import { 
  CreditCard, 
  MessageSquare, 
  Droplets, 
  Zap,
  QrCode,
  Languages,
  Flag,
  Shield,
  TrendingUp,
  Headphones,
  Gift
} from "lucide-react";

export const FeaturesSection = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Header */}
      <div className="container mx-auto px-4 text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            No code solution
          </span>
        </h2>
      </div>

      {/* Main Feature Cards */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {/* Payment Systems Card */}
          <div className="bg-gradient-card border border-border rounded-2xl p-8 shadow-card hover:shadow-glow transition-all duration-500 group hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="text-center mb-8 relative z-10">
              <div className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2 group-hover:animate-pulse">200+</div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">Payment systems</h3>
              <p className="text-muted-foreground">for every country</p>
            </div>
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-background/80 to-background/60 rounded-lg border border-primary/20 hover:border-primary/40 transition-all group/item">
                <span className="font-medium flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">P</div>
                  PayTM
                </span>
                <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded opacity-80 group-hover/item:opacity-100"></div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-background/80 to-background/60 rounded-lg border border-primary/20 hover:border-primary/40 transition-all group/item">
                <span className="font-medium flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">U</div>
                  UPI
                </span>
                <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full opacity-80 group-hover/item:opacity-100"></div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-background/80 to-background/60 rounded-lg border border-primary/20 hover:border-primary/40 transition-all group/item">
                <span className="font-medium flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">₮</div>
                  USDT
                </span>
                <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full opacity-80 group-hover/item:opacity-100"></div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-background/80 to-background/60 rounded-lg border border-primary/20 hover:border-primary/40 transition-all group/item">
                <span className="font-medium flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">S</div>
                  Stripe
                </span>
                <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-indigo-500 rounded opacity-80 group-hover/item:opacity-100"></div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-background/80 to-background/60 rounded-lg border border-primary/20 hover:border-primary/40 transition-all group/item">
                <span className="font-medium flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">PM</div>
                  Perfect Money
                </span>
                <div className="w-6 h-6 bg-gradient-to-br from-red-400 to-rose-500 rounded opacity-80 group-hover/item:opacity-100"></div>
              </div>
              <div className="text-center text-primary/70 text-sm mt-6 font-medium group-hover:text-primary transition-colors">
                and much more...
              </div>
            </div>
          </div>

          {/* Center Enhanced Dashboard Card */}
          <div className="bg-gradient-card border border-border rounded-2xl p-8 shadow-card hover:shadow-glow transition-all duration-500 group hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
            {/* Animated particles background */}
            <div className="absolute inset-0">
              <div className="absolute top-10 left-10 w-2 h-2 bg-primary/30 rounded-full animate-ping"></div>
              <div className="absolute top-20 right-16 w-1 h-1 bg-accent/50 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-16 left-20 w-1.5 h-1.5 bg-primary/40 rounded-full animate-ping delay-700"></div>
            </div>
            
            <div className="text-center relative z-10">
              <h3 className="text-xl font-semibold mb-2 bg-gradient-primary bg-clip-text text-transparent group-hover:animate-pulse">Easy start</h3>
              <p className="text-muted-foreground mb-8">to run own panel</p>
            </div>
            
            {/* Enhanced Dashboard Visual */}
            <div className="relative w-56 h-56 mx-auto mb-6">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 group-hover:border-primary/40 transition-all duration-500 animate-spin-slow"></div>
              
              {/* Feature Icons */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-gradient-card rounded-lg p-2 border border-primary/30 group-hover:border-primary/50 transition-all">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs text-primary font-medium block mt-1">DDOS</span>
              </div>
              
              <div className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gradient-card rounded-lg p-2 border border-primary/30 group-hover:border-primary/50 transition-all">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs text-primary font-medium block mt-1">Tracker</span>
              </div>
              
              <div className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gradient-card rounded-lg p-2 border border-primary/30 group-hover:border-primary/50 transition-all">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs text-primary font-medium block mt-1">Premium</span>
              </div>
              
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-card rounded-lg p-2 border border-primary/30 group-hover:border-primary/50 transition-all">
                <Headphones className="w-4 h-4 text-primary" />
                <span className="text-xs text-primary font-medium block mt-1">Support</span>
              </div>
              
              {/* Center Dashboard */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-glow group-hover:shadow-xl transition-all duration-500 group-hover:scale-110">
                <Zap className="w-10 h-10 text-primary-foreground animate-pulse" />
              </div>
              
              {/* Animated connection lines */}
              <div className="absolute top-1/2 left-1/2 w-0.5 h-16 bg-gradient-to-t from-primary/60 to-transparent transform-gpu origin-bottom -translate-x-1/2 -rotate-12 group-hover:rotate-12 transition-transform duration-1000"></div>
              <div className="absolute top-1/2 left-1/2 w-0.5 h-16 bg-gradient-to-t from-primary/60 to-transparent transform-gpu origin-bottom -translate-x-1/2 rotate-12 group-hover:-rotate-12 transition-transform duration-1000"></div>
            </div>
          </div>

          {/* Language Localizations Card */}
          <div className="bg-gradient-card border border-border rounded-2xl p-8 shadow-card hover:shadow-glow transition-all duration-500 group hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="text-center mb-8 relative z-10">
              <div className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2 group-hover:animate-pulse">20+</div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">Language</h3>
              <p className="text-muted-foreground">localizations</p>
            </div>
            <div className="grid grid-cols-5 gap-3 relative z-10">
              {[
                { flag: "🇩🇪", name: "DE", color: "from-red-500 to-yellow-500" },
                { flag: "🇰🇷", name: "KR", color: "from-blue-500 to-red-500" },
                { flag: "🇺🇸", name: "US", color: "from-blue-500 to-red-500" },
                { flag: "🇮🇳", name: "IN", color: "from-orange-500 to-green-500" },
                { flag: "🇵🇰", name: "PK", color: "from-green-500 to-white" },
              ].map((country, index) => (
                <div key={index} className={`aspect-square bg-gradient-to-br ${country.color} p-0.5 rounded-lg hover:scale-110 transition-all duration-300 group/flag`}>
                  <div className="w-full h-full bg-background/90 rounded-md flex flex-col items-center justify-center p-2 hover:bg-background/70 transition-colors">
                    <div className="text-2xl mb-1 group-hover/flag:scale-110 transition-transform">{country.flag}</div>
                    <div className="text-xs text-primary font-medium group-hover/flag:text-primary/80">{country.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="text-center p-8 bg-gradient-card border border-border rounded-xl shadow-card hover:shadow-glow transition-all duration-500 group hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Icon with glow effect */}
            <div className="relative z-10 mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
                <QrCode className="w-8 h-8 text-primary group-hover:text-primary/80 transition-colors" />
              </div>
              {/* Floating particles */}
              <div className="absolute top-0 right-0 w-1 h-1 bg-primary/50 rounded-full animate-ping"></div>
              <div className="absolute bottom-0 left-0 w-0.5 h-0.5 bg-accent/60 rounded-full animate-pulse delay-500"></div>
            </div>
            
            <h3 className="font-semibold mb-3 text-lg group-hover:text-primary transition-colors relative z-10">Promocode</h3>
            <p className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors relative z-10">Create promo codes to attract new users or retain old ones</p>
            
            {/* Gift icon decoration */}
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
              <Gift className="w-6 h-6 text-primary" />
            </div>
          </div>
          
          <div className="text-center p-8 bg-gradient-card border border-border rounded-xl shadow-card hover:shadow-glow transition-all duration-500 group hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Icon with glow effect */}
            <div className="relative z-10 mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl flex items-center justify-center group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
                <MessageSquare className="w-8 h-8 text-primary group-hover:text-primary/80 transition-colors" />
              </div>
              {/* Message bubbles animation */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent/60 rounded-full animate-bounce"></div>
              <div className="absolute -top-2 right-2 w-1 h-1 bg-primary/50 rounded-full animate-bounce delay-200"></div>
            </div>
            
            <h3 className="font-semibold mb-3 text-lg group-hover:text-primary transition-colors relative z-10">Pop-up messages</h3>
            <p className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors relative z-10">Notify your users and keep in touch with them</p>
            
            {/* Notification dot */}
            <div className="absolute top-4 right-4 w-3 h-3 bg-accent rounded-full opacity-30 group-hover:opacity-60 transition-all animate-pulse"></div>
          </div>
          
          <div className="text-center p-8 bg-gradient-card border border-border rounded-xl shadow-card hover:shadow-glow transition-all duration-500 group hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Icon with glow effect */}
            <div className="relative z-10 mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
                <Droplets className="w-8 h-8 text-primary group-hover:text-primary/80 transition-colors" />
              </div>
              {/* Drip animation */}
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2">
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-ping opacity-60"></div>
              </div>
            </div>
            
            <h3 className="font-semibold mb-3 text-lg group-hover:text-primary transition-colors relative z-10">Drip Feed</h3>
            <p className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors relative z-10">Raise social engagement at the desired speed</p>
            
            {/* Speed lines */}
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 opacity-20 group-hover:opacity-40 transition-opacity">
              <div className="space-y-1">
                <div className="w-4 h-0.5 bg-primary rounded-full"></div>
                <div className="w-3 h-0.5 bg-primary rounded-full"></div>
                <div className="w-2 h-0.5 bg-primary rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="text-center p-8 bg-gradient-card border border-border rounded-xl shadow-card hover:shadow-glow transition-all duration-500 group hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Icon with glow effect */}
            <div className="relative z-10 mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
                <Zap className="w-8 h-8 text-primary group-hover:text-primary/80 transition-colors animate-pulse" />
              </div>
              {/* Electric sparks */}
              <div className="absolute top-2 right-2 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-orange-400 rounded-full animate-pulse delay-300"></div>
            </div>
            
            <h3 className="font-semibold mb-3 text-lg group-hover:text-primary transition-colors relative z-10">Integrations</h3>
            <p className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors relative z-10">We have a bunch of integrations to fit in your panel</p>
            
            {/* Connection nodes */}
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
              <div className="w-4 h-4 relative">
                <div className="absolute w-1 h-1 bg-primary rounded-full top-0 left-0"></div>
                <div className="absolute w-1 h-1 bg-primary rounded-full top-0 right-0"></div>
                <div className="absolute w-1 h-1 bg-primary rounded-full bottom-0 left-0"></div>
                <div className="absolute w-1 h-1 bg-primary rounded-full bottom-0 right-0"></div>
                <div className="absolute w-0.5 h-4 bg-primary/50 left-1/2 transform -translate-x-1/2"></div>
                <div className="absolute w-4 h-0.5 bg-primary/50 top-1/2 transform -translate-y-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
