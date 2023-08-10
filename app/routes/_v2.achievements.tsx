import { Button, ButtonColorVariants } from '~/components/Button'
import { Container } from '~/components/Layout/Container'

const AchievementsIndexRoute = () => {
  return (
    <>
      <Container className="max-w-max rounded-3xl bg-teal-600">
        <main className="m-2 flex gap-5">
          <section className="mx-auto self-center">
            <img
              className="hidden max-h-60 max-w-xs self-center sm:block"
              src="/images/routes/achievements/trophy.png"
              alt="Trophy"
            ></img>
          </section>
          <section className="mx-auto my-5 max-w-lg space-y-8">
            <h1 className="flex items-center justify-center text-3xl font-semibold text-white">
              Bienvenido a Logros
            </h1>
            <p className=" mx-auto flex justify-center text-white">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Et, sit
              a voluptates cupiditate autem nam illum praesentium atque
              architecto odit at quis voluptatem quo natus eius sunt ipsum.
              Soluta, doloremque.
            </p>
            <span className="flex justify-center ">
              <div className="mx-auto">
                <Button
                  href="https://docs.google.com/forms/d/e/1FAIpQLSdBSCR3eWdIhvgENg1GRotj6CkpsDXHIVk2LwgSLWV1BBl_6A/viewform?vc=0&c=0&w=1&flr=0"
                  variant={ButtonColorVariants.SECONDARY}
                  className="bg-white hover:bg-white"
                >
                  Solicitar el acceso a Logros
                </Button>
              </div>
            </span>
          </section>
        </main>
      </Container>
    </>
  )
}

export default AchievementsIndexRoute
