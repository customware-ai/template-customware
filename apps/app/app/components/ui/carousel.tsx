"use client";

import { type EmblaCarouselType, type EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import * as React from "react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

type CarouselContextValue = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: EmblaCarouselType | undefined;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
};

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

function useCarousel(): CarouselContextValue {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a Carousel");
  }

  return context;
}

type CarouselProps = {
  opts?: EmblaOptionsType;
  setApi?: (api: EmblaCarouselType) => void;
} & React.ComponentProps<"section">;

function Carousel({
  opts,
  setApi,
  className,
  children,
  ...props
}: CarouselProps): React.ReactElement {
  const [carouselRef, api] = useEmblaCarousel(opts);

  const subscribeToNavigation = React.useCallback(
    (onStoreChange: () => void): (() => void) => {
      if (!api) {
        return (): void => undefined;
      }

      api.on("reInit", onStoreChange);
      api.on("select", onStoreChange);

      return (): void => {
        api.off("reInit", onStoreChange);
        api.off("select", onStoreChange);
      };
    },
    [api],
  );

  const getNavigationSnapshot = React.useCallback((): number => {
    if (!api) {
      return 0;
    }

    return Number(api.canScrollPrev()) | (Number(api.canScrollNext()) << 1);
  }, [api]);

  const navigationSnapshot = React.useSyncExternalStore(
    subscribeToNavigation,
    getNavigationSnapshot,
    (): number => 0,
  );
  const canScrollPrev = (navigationSnapshot & 1) !== 0;
  const canScrollNext = (navigationSnapshot & 2) !== 0;

  const scrollPrev = React.useCallback((): void => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback((): void => {
    api?.scrollNext();
  }, [api]);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setApi?.(api);
  }, [api, setApi]);

  return (
    <CarouselContext.Provider
      value={{ carouselRef, api, scrollPrev, scrollNext, canScrollPrev, canScrollNext }}
    >
      <section
        data-slot="carousel"
        className={cn("relative", className)}
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </section>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">): React.ReactElement {
  const { carouselRef } = useCarousel();

  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div data-slot="carousel-content" className={cn("-ml-4 flex", className)} {...props} />
    </div>
  );
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      data-slot="carousel-item"
      aria-roledescription="slide"
      className={cn("min-w-0 shrink-0 grow-0 basis-full pl-4", className)}
      {...props}
    />
  );
}

function CarouselPrevious({
  className,
  ...props
}: React.ComponentProps<typeof Button>): React.ReactElement {
  const { scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      data-slot="carousel-previous"
      variant="outline"
      size="icon-sm"
      className={cn("absolute left-2 top-1/2 -translate-y-1/2", className)}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeftIcon className="size-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

function CarouselNext({
  className,
  ...props
}: React.ComponentProps<typeof Button>): React.ReactElement {
  const { scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      data-slot="carousel-next"
      variant="outline"
      size="icon-sm"
      className={cn("absolute right-2 top-1/2 -translate-y-1/2", className)}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRightIcon className="size-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
  type EmblaCarouselType as CarouselApi,
};
