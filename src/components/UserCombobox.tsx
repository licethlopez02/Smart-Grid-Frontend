import {
  useState,
  useRef,
  useEffect,
  useId,
  type KeyboardEvent,
} from 'react'
import { ChevronDown } from 'lucide-react'
import type { UsuarioResponse } from '../api/dto'
import { filterUsers } from '../utils/userSearch'

interface UserComboboxProps {
  id: string
  users: UsuarioResponse[]
  /** ID del usuario seleccionado como string, o '' si no hay selección. */
  value: string
  onChange: (userId: string) => void
  placeholder: string
  noResultsText: string
  inputClassName: string
}

function userLabel(u: UsuarioResponse): string {
  return `${u.nombre} — ${u.correo}`
}

/**
 * Combobox con búsqueda para seleccionar un usuario.
 *
 * - Filtra por nombre y correo, insensible a mayúsculas y tildes.
 * - Navegable con teclado: flechas ↑↓, Enter para seleccionar, Escape para cerrar.
 * - Accesible: role="combobox", aria-expanded, aria-controls, role="listbox",
 *   role="option", aria-activedescendant, aria-selected.
 * - El valor enviado al backend (userId numérico en string) no cambia.
 */
function UserCombobox({
  id,
  users,
  value,
  onChange,
  placeholder,
  noResultsText,
  inputClassName,
}: UserComboboxProps) {
  const listboxId = useId()

  /**
   * `query` es el texto que el operador ha escrito en el input.
   * Solo se usa cuando NO hay un usuario confirmado (value === '').
   * Cuando hay selección confirmada (value !== ''), el input muestra
   * la etiqueta del usuario derivada directamente, sin estado extra.
   */
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number>(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // El texto visible en el input: si hay selección confirmada mostramos su etiqueta;
  // si no, mostramos lo que el usuario está escribiendo.
  const confirmedUser = value ? users.find((u) => String(u.id) === value) : undefined
  const inputDisplayValue = confirmedUser ? userLabel(confirmedUser) : query

  // La lista filtrada siempre se calcula sobre query (no sobre la etiqueta confirmada,
  // para que al reabrir el desplegable tras confirmar se muestren todos).
  const filtered = filterUsers(users, query)

  // Cierra el desplegable al hacer clic fuera del componente
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        // Cerramos sin limpiar query aquí; la limpieza ocurre en closeList() cuando hay foco
        setOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  // Desplaza el item activo a la vista cuando cambia con el teclado
  useEffect(() => {
    if (!open || activeIndex < 0) return
    const item = listRef.current?.children[activeIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  function openList() {
    setOpen(true)
    setActiveIndex(-1)
  }

  function closeList() {
    setOpen(false)
    setActiveIndex(-1)
    if (!value) setQuery('')
  }

  function selectUser(user: UsuarioResponse) {
    setQuery('')          // limpia query para próxima apertura
    onChange(String(user.id))
    setOpen(false)
    setActiveIndex(-1)
    inputRef.current?.blur()
  }

  function handleInputChange(text: string) {
    setQuery(text)
    if (value) onChange('')   // escribir invalida la selección previa
    if (!open) openList()
    setActiveIndex(-1)
  }

  function handleFocus() {
    // Al recibir foco con selección previa, limpiamos query para poder filtrar
    if (value) setQuery('')
    openList()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!open) { openList(); return }
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (open && activeIndex >= 0 && filtered[activeIndex]) {
          selectUser(filtered[activeIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        closeList()
        break
      case 'Tab':
        closeList()
        break
    }
  }

  const activeOptionId = open && activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined

  return (
    <div ref={containerRef} className="relative mt-1">
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          value={inputDisplayValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className={`${inputClassName} pr-9`}
          placeholder={placeholder}
        />
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="Usuarios"
          className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg text-sm"
        >
          {filtered.length === 0 ? (
            <li
              role="option"
              aria-selected={false}
              aria-disabled="true"
              className="px-4 py-2 text-gray-400 select-none"
            >
              {noResultsText}
            </li>
          ) : (
            filtered.map((u, idx) => {
              const isActive = idx === activeIndex
              const isSelected = String(u.id) === value
              return (
                <li
                  key={u.id}
                  id={`${listboxId}-opt-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  onPointerDown={(e) => {
                    // Previene que el input pierda foco antes del click
                    e.preventDefault()
                    selectUser(u)
                  }}
                  className={[
                    'flex flex-col px-4 py-2 cursor-pointer select-none',
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-900 hover:bg-gray-50',
                    isSelected ? 'font-medium' : '',
                  ].join(' ')}
                >
                  <span>{u.nombre}</span>
                  <span className="text-xs text-gray-500">{u.correo}</span>
                </li>
              )
            })
          )}
        </ul>
      )}
    </div>
  )
}

export default UserCombobox
