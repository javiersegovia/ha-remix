import type { StylesConfig } from 'react-select'
import type { TReactSelectOption } from './Select'

export function selectStyles<isMulti extends boolean>(
  hasError: boolean
): Partial<StylesConfig<TReactSelectOption, isMulti>> {
  return {
    container: (provided, state) => ({
      ...provided,
      ...(state.isDisabled && { cursor: 'not-allowed', pointerEvents: 'auto' }),
    }),
    control: (_, state) => ({
      display: 'flex',
      borderRadius: '2rem',
      paddingTop: '0.5rem',
      paddingBottom: '0.5rem',
      paddingLeft: '1rem',
      paddingRight: '0.75rem',
      backgroundColor: '#ffffff',
      fontSize: '0.875rem',
      lineHeight: '1.5rem',
      alignItems: 'center',
      width: '100%',
      borderWidth: '1px',
      borderColor: '#D1D5DB',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',

      ...(state.hasValue && { paddingTop: '0.5rem', paddingBottom: '0.5rem' }),

      ...(hasError && { color: '#DC2626', borderColor: '#EF4444' }),

      ...(state.isFocused && {
        borderColor: '#60A5FA',
        boxShadow:
          'var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) #60A5FA',
        outline: '0',
      }),

      ...(state.isFocused &&
        hasError && { borderColor: '#EF4444', outlineColor: '#EF4444' }),

      ...(state.isDisabled && {
        backgroundColor: '#E2E8F0',
        cursor: 'not-allowed',
      }),
    }),
    option: (provided, state) => ({
      ...provided,
      display: 'flex',
      position: 'relative',
      paddingTop: '0.5rem',
      paddingBottom: '0.5rem',
      paddingRight: '1rem',
      paddingLeft: '2rem',
      color: '#374151',
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
      textAlign: 'left',
      justifyContent: 'space-between',
      width: '100%',
      height: '100%',
      userSelect: 'none',

      ...(state.isFocused && { backgroundColor: '#F3F4F6' }),

      ...(state.isSelected && {
        backgroundColor: '#F3F4F6',
        color: '#000000',
        fontWeight: '600',
      }),

      ...(state.isSelected &&
        state.isFocused && { backgroundColor: '#E5E7EB' }),
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      ...{ color: '#6B7280' },
    }),
    input: (provided) => ({
      ...provided,
      ...{
        borderWidth: '0',
        boxShadow:
          'var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color)',
        outline: '0',
      },
    }),
    singleValue: (provided, state) => ({
      ...provided,
      ...{ paddingLeft: '0', paddingRight: '0', margin: '0' },
      ...(hasError && { color: '#DC2626' }),
      ...(state.isDisabled && { color: '#6B7280' }),
    }),
    placeholder: (provided) => ({
      ...provided,
      ...{
        paddingTop: '0',
        paddingBottom: '0',
        margin: '0',
        color: 'rgb(148, 163, 184)',
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: 0,
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      paddingRight: 0,
      paddingTop: 0,
      paddingBottom: 0,
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      margin: 0,
    }),
    clearIndicator: (provided) => ({
      ...provided,
      paddingTop: 0,
      paddingBottom: 0,
      borderRadius: '0.375rem',
    }),
    multiValue: (provided) => ({
      ...provided,
      paddingLeft: '8px',
      paddingRight: '0px',
      backgroundColor: '#C8E3FC',
      borderRadius: '22px',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      borderTopRightRadius: '22px',
      borderBottomRightRadius: '22px',
      paddingRight: '8px',
      paddingLeft: '4px',
      marginLeft: '4px',
    }),
  }
}
