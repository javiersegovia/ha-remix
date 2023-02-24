import type { Settings } from 'react-slick'
import Slider from 'react-slick'
import { twMerge } from 'tailwind-merge'

const settings: Settings = {
  arrows: false,
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: false,
  pauseOnHover: true,
}

interface CarouselProps {
  className?: string
  children?: React.ReactNode
}

export const Carousel = ({ className, children }: CarouselProps) => {
  return (
    <Slider {...settings} className={twMerge(className)}>
      {children}
    </Slider>
  )
}
