export default function RoleCard({ role }: any) {
  return (
    <div className="bg-amber-50 border-4 border-yellow-900 rounded-xl shadow-lg overflow-hidden">

      <div className="bg-yellow-200 px-3 py-2 font-bold text-lg border-b border-yellow-900">
        {role.name}
      </div>

      <div className="px-3 text-xs italic text-gray-700">
        {role.type}
      </div>

      <div className="aspect-[3/4] bg-gray-300 overflow-hidden">
        {role.image ? (
          <img src={role.image} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
            image later 🙂
          </div>
        )}
      </div>

      <div className="p-3 text-sm">
        <b>{role.ability}</b>
      </div>

      <div className="px-3 pb-2 text-sm">
        {role.description}
      </div>

      <div className="px-3 pb-3 italic text-xs text-gray-600">
        {role.flavor}
      </div>

    </div>
  )
}