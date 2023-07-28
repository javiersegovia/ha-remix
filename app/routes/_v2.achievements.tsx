import { Button } from '~/components/Button'
import { Container } from '~/components/Layout/Container'

const AchievementsIndexRoute = () => {
  return (
    <>
      <Container className="max-w-max rounded-3xl bg-steelBlue-600">
        <section className="my-5 space-y-8">
          <h1 className="flex items-center justify-center text-3xl font-semibold text-white">
            Bienvenido a Logros
          </h1>
          <p className=" mx-auto flex h-1/2 w-1/2 justify-center text-white">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Et, sit a
            voluptates cupiditate autem nam illum praesentium atque architecto
            odit at quis voluptatem quo natus eius sunt ipsum. Soluta,
            doloremque.
          </p>
          <span className="flex justify-center ">
            <Button
              href="https://docs.google.com/forms/d/e/1FAIpQLSdBSCR3eWdIhvgENg1GRotj6CkpsDXHIVk2LwgSLWV1BBl_6A/viewform?vc=0&c=0&w=1&flr=0"
              className="flex max-w-max  bg-white text-slate-500 hover:bg-white"
            >
              Solicita el acceso a Logros
            </Button>
          </span>
        </section>
      </Container>
    </>
  )
}

export default AchievementsIndexRoute
