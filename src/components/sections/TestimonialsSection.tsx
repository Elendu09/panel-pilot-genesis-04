import { Star } from "lucide-react";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "teateagram",
      text: "Great SMM panel, I have been using it basically from the start of the platform. There is not much to say other than that Socpanel is far ahead of competitors in terms of product. Its very convenient to work with SMM services here.",
      rating: 5
    },
    {
      name: "allpanel",
      text: "Socpanel changed my life, I became biggest telegram provider due to this platform. Very good functions to make my own services. By the way, you can find me on top providers list 😎",
      rating: 5
    },
    {
      name: "sochype",
      text: "I was surprised when I ran into Socpanel, truly no-code solution. Before I had issues with my panel with free scripts and etc. Here I created a truly amazing SMM panel.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What our{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              users say
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of successful panel owners who trust our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-gradient-card border border-border rounded-xl p-6 shadow-card hover:shadow-elegant transition-all duration-300"
            >
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                "{testimonial.text}"
              </p>
              <div className="font-semibold text-primary">@{testimonial.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};