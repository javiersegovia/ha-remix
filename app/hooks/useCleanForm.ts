import { useLayoutEffect } from 'react'
import { checkIfIdExistInList } from '~/utils/arrays'

interface UseCleanProps<T extends string | number> {
  /** This value will be used to check if we should clean up the value in the form */
  shouldClean?: boolean
  options?: Array<{ id: T }>
  value: T | undefined
  setValue: (newValue: T | undefined) => void
}

/**
 * This function is used when we have dynamic options inside a Selector, and we need to remove the selected value
 * if the options list change and the value is not present anymore inside the options.
 *
 * Example: Country-State-City selectors.
 *
 * If the User selects a Country, then a State, and then changes the country, we have to remove the value of the selected state.
 *  */
export const useCleanForm = <T extends string | number>({
  shouldClean = false,
  options,
  value,
  setValue,
}: UseCleanProps<T>) => {
  useLayoutEffect(() => {
    if (shouldClean || !options || options?.length === 0) {
      setValue(undefined)
      return
    }

    if (!value) return // If we don't have stateIdValue selected, cleanup is not needed

    const idExist = checkIfIdExistInList({
      list: options,
      id: value,
    })

    if (!idExist) {
      setValue(undefined)
      return
    }
  }, [shouldClean, options, value, setValue])
}
