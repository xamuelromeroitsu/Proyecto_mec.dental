import Hero from '../Hero/Hero'
import Gallery from '../Gallery/Gallery'
import Services from '../Services/Services'
import About from '../About/About'
import Contact from '../Contact/Contact'
import Footer from '../Footer/Footer'

export default function Presentation({ carouselImages }) {
  return (
    <div>
      <Hero />
      <Gallery images={carouselImages} />
      <Services />
      <About />
      <Contact />
      {/* Cierre de página: marca + datos + navegación + copyright */}
      <Footer />
    </div>
  )
}
