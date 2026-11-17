import Hero from '../Hero/Hero'
import Gallery from '../Gallery/Gallery'
import Services from '../Services/Services'
import About from '../About/About'
import Contact from '../Contact/Contact'

export default function Presentation({ carouselImages }) {
  return (
    <div>
      <Hero />
      <Gallery images={carouselImages} />
      <Services />
      <About />
      <Contact />
    </div>
  )
}
