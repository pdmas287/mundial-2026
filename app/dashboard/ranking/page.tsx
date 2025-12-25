import Card from '@/components/ui/Card'

export default function RankingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Ranking Global</h1>
        <p className="text-white/60">Tabla de posiciones de todos los usuarios</p>
      </div>

      <Card className="text-center py-16">
        <span className="text-6xl mb-4 block">🏆</span>
        <h3 className="text-2xl font-bold text-white mb-2">Próximamente</h3>
        <p className="text-white/60">
          El ranking global estará disponible próximamente
        </p>
      </Card>
    </div>
  )
}
