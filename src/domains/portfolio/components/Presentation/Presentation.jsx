import Hero from '../Hero/Hero'
import Gallery from '../Gallery/Gallery'
import Services from '../Services/Services'
import About from '../About/About'
import Contact from '../Contact/Contact'

export default function Presentation({ carouselImages, onNavigateLogin }) {
  return (
    <div>
      <Hero onNavigateLogin={onNavigateLogin} />
      <Gallery images={carouselImages} />
      <Services />
      <About onNavigateLogin={onNavigateLogin} />
      <Contact />
    </div>
  )
}
