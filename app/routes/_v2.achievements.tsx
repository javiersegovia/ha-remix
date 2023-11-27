import { Button, ButtonColorVariants } from '~/components/Button'
import { Container } from '~/components/Layout/Container'

const AchievementsIndexRoute = () => {
  return (
    <>
      <Container className="max-w-max rounded-3xl bg-gradient-to-br from-teal-400 to-indigo-800">
        <main className="m-2 flex gap-5">
          <section className="mx-auto self-center">
            <img
              className="hidden max-h-60 max-w-xs self-center sm:block"
              src="/images/routes/achievements/trophy.png"
              alt="Trophy"
            />
          </section>

          <section className="mx-auto my-5 max-w-lg space-y-8">
            <h1 className="flex items-center text-3xl font-semibold text-white">
              Bienvenido a Logros
            </h1>
            <p className="mx-auto flex justify-center text-white">
              Un sistema gamificado de evaluación de desempeño que destaca los
              logros individuales de los empleados, asignando clasificaciones
              basadas en estos logros y premiando con bonificaciones o
              beneficios a quienes alcanzan los niveles más altos.
            </p>

            <div className="mx-auto">
              <Button
                href="https://docs.google.com/forms/d/e/1FAIpQLSdBSCR3eWdIhvgENg1GRotj6CkpsDXHIVk2LwgSLWV1BBl_6A/viewform?vc=0&c=0&w=1&flr=0"
                variant={ButtonColorVariants.SECONDARY}
                className="bg-white hover:bg-white md:w-auto"
              >
                Solicitar el acceso a Logros
              </Button>
            </div>
          </section>
        </main>
      </Container>
    </>
  )
}

export default AchievementsIndexRoute
