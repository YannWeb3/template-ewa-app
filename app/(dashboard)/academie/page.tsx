"use client"

import { useState, useMemo } from "react"
import {
  GraduationCap,
  Search,
  PlayCircle,
  FileText,
  BookOpen,
  Award,
  Clock,
  ChevronRight,
  X,
  Star,
  Users,
  TrendingUp,
  CheckCircle2,
  Lock,
  Plus,
  MoreHorizontal,
  Trash2,
  EyeOff,
  Eye,
  ExternalLink,
  GripVertical,
} from "lucide-react"

type CourseLevel = "Débutant" | "Intermédiaire" | "Avancé"
type CourseFormat = "Vidéo" | "Article" | "Quiz" | "Atelier"
type CourseStatus = "published" | "draft"

interface Lesson {
  id: string
  title: string
  duration: string
  url?: string
}

interface Course {
  id: string
  title: string
  description: string
  category: string
  level: CourseLevel
  format: CourseFormat
  duration: string
  lessons: Lesson[]
  students: number
  rating: number
  completed: boolean
  progress: number
  tags: string[]
  status: CourseStatus
  thumbnail?: string
}

const YOUTUBE_THUMB = (url: string) => {
  const id = url.match(/(?:v=|\/)([\w-]{11})/)?.[1]
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : undefined
}

const INITIAL_COURSES: Course[] = [
  {
    id: "course-pres-ewa",
    title: "Présentation EWA",
    description: "Vidéo d'introduction à l'identité EWA, l'approche et la méthode de travail.",
    category: "Onboarding",
    level: "Débutant",
    format: "Vidéo",
    duration: "13 min",
    lessons: [{ id: "l1", title: "Présentation EWA", duration: "13 min", url: "https://www.youtube.com/watch?v=vJzcr2YXwFY&t=13s" }],
    students: 24,
    rating: 4.9,
    completed: false,
    progress: 0,
    tags: ["Onboarding", "EWA"],
    status: "published",
    thumbnail: YOUTUBE_THUMB("https://www.youtube.com/watch?v=vJzcr2YXwFY&t=13s"),
  },
  {
    id: "course-top-1er-jour",
    title: "Ton premier jour — Top départ",
    description: "Les essentiels pour démarrer : organisation, outils, premiers contacts.",
    category: "Onboarding",
    level: "Débutant",
    format: "Vidéo",
    duration: "1 min",
    lessons: [{ id: "l1", title: "Ton premier jour", duration: "1 min", url: "https://www.youtube.com/watch?v=oUlpbue-Gw0&t=1s" }],
    students: 22,
    rating: 4.8,
    completed: false,
    progress: 0,
    tags: ["Onboarding", "Premier jour"],
    status: "published",
    thumbnail: YOUTUBE_THUMB("https://www.youtube.com/watch?v=oUlpbue-Gw0&t=1s"),
  },
  {
    id: "course-hooks-approche",
    title: "Hooks et approche",
    description: "Comment accrocher dès les premières secondes et structurer l'approche créative.",
    category: "Création",
    level: "Intermédiaire",
    format: "Vidéo",
    duration: "2 min",
    lessons: [{ id: "l1", title: "Hooks et approche", duration: "2 min", url: "https://www.youtube.com/watch?v=WRUhOoxAfCQ&t=2s" }],
    students: 16,
    rating: 4.7,
    completed: false,
    progress: 0,
    tags: ["Hooks", "Storytelling"],
    status: "published",
    thumbnail: YOUTUBE_THUMB("https://www.youtube.com/watch?v=WRUhOoxAfCQ&t=2s"),
  },
  {
    id: "course-sound-design",
    title: "Sound Design",
    description: "Bases du sound design : choix musicaux, SFX, mixage rapide pour mobile.",
    category: "Technique",
    level: "Avancé",
    format: "Vidéo",
    duration: "3 min",
    lessons: [{ id: "l1", title: "Sound Design", duration: "3 min", url: "https://www.youtube.com/watch?v=1zzZIG0ewnI&t=3s" }],
    students: 12,
    rating: 4.6,
    completed: false,
    progress: 0,
    tags: ["Audio", "Mixage"],
    status: "published",
    thumbnail: YOUTUBE_THUMB("https://www.youtube.com/watch?v=1zzZIG0ewnI&t=3s"),
  },
  {
    id: "course-couper-bon-moment",
    title: "Couper au bon moment",
    description: "Timing, raccords et rythme pour des coupes qui tiennent l'attention.",
    category: "Montage",
    level: "Intermédiaire",
    format: "Vidéo",
    duration: "4 min",
    lessons: [{ id: "l1", title: "Couper au bon moment", duration: "4 min", url: "https://www.youtube.com/watch?v=oUlpbue-Gw0&t=4s" }],
    students: 14,
    rating: 4.8,
    completed: false,
    progress: 0,
    tags: ["Montage", "Rythme"],
    status: "published",
    thumbnail: YOUTUBE_THUMB("https://www.youtube.com/watch?v=oUlpbue-Gw0&t=4s"),
  },
  {
    id: "course-fondamentaux-ewa",
    title: "Les fondamentaux du montage EWA",
    description: "Workflow, organisation des rushs, nomenclature et premiers exports.",
    category: "Montage",
    level: "Débutant",
    format: "Vidéo",
    duration: "2h30",
    lessons: [
      { id: "l1", title: "Workflow EWA", duration: "25 min" },
      { id: "l2", title: "Nomenclature", duration: "20 min" },
      { id: "l3", title: "Premiers exports", duration: "30 min" },
    ],
    students: 18,
    rating: 4.8,
    completed: true,
    progress: 100,
    tags: ["Workflow", "Premiere Pro"],
    status: "published",
  },
  {
    id: "course-color-grading",
    title: "Color grading pour réseaux sociaux",
    description: "Luts, correction d'exposition, cohérence visuelle sur Instagram et TikTok.",
    category: "Technique",
    level: "Intermédiaire",
    format: "Vidéo",
    duration: "3h15",
    lessons: [
      { id: "l1", title: "Correction primaire", duration: "45 min" },
      { id: "l2", title: "LUTs et looks", duration: "50 min" },
    ],
    students: 14,
    rating: 4.7,
    completed: false,
    progress: 65,
    tags: ["DaVinci Resolve", "Color"],
    status: "published",
  },
  {
    id: "course-motion",
    title: "Motion design : de 0 à l'animation",
    description: "Principes d'animation, After Effects, exports optimisés pour les stories.",
    category: "Motion",
    level: "Intermédiaire",
    format: "Atelier",
    duration: "4h00",
    lessons: [
      { id: "l1", title: "Principes d'animation", duration: "1h" },
      { id: "l2", title: "After Effects avancé", duration: "2h" },
    ],
    students: 9,
    rating: 4.9,
    completed: false,
    progress: 30,
    tags: ["After Effects", "Motion"],
    status: "published",
  },
]

const levelConfig: Record<CourseLevel, string> = {
  Débutant: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  Intermédiaire: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  Avancé: "bg-red-400/10 text-red-400 border-red-400/20",
}

const formatConfig: Record<CourseFormat, { icon: React.ElementType; color: string }> = {
  Vidéo: { icon: PlayCircle, color: "text-ewa-orange" },
  Article: { icon: FileText, color: "text-blue-400" },
  Quiz: { icon: BookOpen, color: "text-purple-400" },
  Atelier: { icon: Users, color: "text-pink-400" },
}

function formatLessonsCount(lessons: Lesson[]) {
  return `${lessons.length} leçon${lessons.length > 1 ? "s" : ""}`
}

function extractYouTubeId(url?: string) {
  return url?.match(/(?:v=|\/)([\w-]{11})/)?.[1]
}

function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${star <= Math.round(rating) ? "fill-ewa-orange text-ewa-orange" : "text-white/20"}`}
        />
      ))}
      <span className="ml-1 text-xs text-white/60">{rating.toFixed(1)}</span>
    </div>
  )
}

export default function AcademiePage() {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("Tous")
  const [level, setLevel] = useState("Tous")
  const [format, setFormat] = useState("Tous")
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all")
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    title: "",
    description: "",
    category: "",
    level: "Débutant",
    format: "Vidéo",
    duration: "",
    tags: [],
    status: "draft",
  })

  const categories = useMemo(() => ["Tous", ...Array.from(new Set(courses.map((c) => c.category)))], [courses])
  const levels = ["Tous", "Débutant", "Intermédiaire", "Avancé"]
  const formats = useMemo(() => ["Tous", ...Array.from(new Set(courses.map((c) => c.format)))], [courses])

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const term = search.toLowerCase()
      const matchesSearch =
        !term ||
        course.title.toLowerCase().includes(term) ||
        course.description.toLowerCase().includes(term) ||
        course.tags.some((t) => t.toLowerCase().includes(term))
      const matchesCategory = category === "Tous" || course.category === category
      const matchesLevel = level === "Tous" || course.level === level
      const matchesFormat = format === "Tous" || course.format === format
      const matchesStatus = statusFilter === "all" || course.status === statusFilter
      return matchesSearch && matchesCategory && matchesLevel && matchesFormat && matchesStatus
    })
  }, [courses, search, category, level, format, statusFilter])

  const stats = useMemo(() => {
    const total = courses.length
    const published = courses.filter((c) => c.status === "published").length
    const draft = courses.filter((c) => c.status === "draft").length
    const completed = courses.filter((c) => c.completed).length
    const totalStudents = courses.reduce((acc, c) => acc + c.students, 0)
    const avgRating = courses.reduce((acc, c) => acc + c.rating, 0) / (total || 1)
    return { total, published, draft, completed, totalStudents, avgRating }
  }, [courses])

  const activeFiltersCount =
    [category, level, format].filter((v) => v !== "Tous").length + (search ? 1 : 0) + (statusFilter !== "all" ? 1 : 0)

  function toggleStatus(id: string) {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, status: c.status === "published" ? "draft" : "published" } : c)))
  }

  function deleteCourse(id: string) {
    if (confirm("Supprimer cette formation ?")) {
      setCourses((prev) => prev.filter((c) => c.id !== id))
    }
  }

  function handleCreateCourse() {
    if (!newCourse.title || !newCourse.description || !newCourse.category || !newCourse.duration) return
    const course: Course = {
      id: `course-${Date.now()}`,
      title: newCourse.title,
      description: newCourse.description,
      category: newCourse.category,
      level: (newCourse.level as CourseLevel) || "Débutant",
      format: (newCourse.format as CourseFormat) || "Vidéo",
      duration: newCourse.duration,
      lessons: newCourse.lessons?.length ? newCourse.lessons : [{ id: "l1", title: newCourse.title, duration: newCourse.duration }],
      students: 0,
      rating: 0,
      completed: false,
      progress: 0,
      tags: newCourse.tags?.length ? newCourse.tags : [newCourse.category],
      status: (newCourse.status as CourseStatus) || "draft",
      thumbnail: newCourse.lessons?.[0]?.url ? YOUTUBE_THUMB(newCourse.lessons[0].url) : undefined,
    }
    setCourses((prev) => [...prev, course])
    setIsCreateOpen(false)
    setNewCourse({
      title: "",
      description: "",
      category: "",
      level: "Débutant",
      format: "Vidéo",
      duration: "",
      tags: [],
      status: "draft",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Académie</h1>
          <p className="text-sm text-white/40">Catalogue de formations, ressources pédagogiques et onboarding</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-ewa-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ewa-orange/90"
        >
          <Plus className="h-4 w-4" />
          Nouvelle formation
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <BookOpen className="h-4 w-4" />
            <span className="text-xs font-medium">Formations</span>
          </div>
          <p className="text-2xl font-semibold text-white">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <Eye className="h-4 w-4" />
            <span className="text-xs font-medium">Publiées</span>
          </div>
          <p className="text-2xl font-semibold text-white">{stats.published}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <EyeOff className="h-4 w-4" />
            <span className="text-xs font-medium">Dépublier (brouillons)</span>
          </div>
          <p className="text-2xl font-semibold text-white">{stats.draft}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium">Apprenants</span>
          </div>
          <p className="text-2xl font-semibold text-white">{stats.totalStudents}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <Award className="h-4 w-4" />
            <span className="text-xs font-medium">Note moyenne</span>
          </div>
          <p className="text-2xl font-semibold text-white">{stats.avgRating.toFixed(1)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une formation..."
              className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-ewa-orange/50 focus:outline-none"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2.5 text-sm text-white outline-none focus:border-ewa-orange/50"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === "Tous" ? "Toutes les catégories" : c}</option>
            ))}
          </select>

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2.5 text-sm text-white outline-none focus:border-ewa-orange/50"
          >
            {levels.map((l) => (
              <option key={l} value={l}>{l === "Tous" ? "Tous les niveaux" : l}</option>
            ))}
          </select>

          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2.5 text-sm text-white outline-none focus:border-ewa-orange/50"
          >
            {formats.map((f) => (
              <option key={f} value={f}>{f === "Tous" ? "Tous les formats" : f}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2.5 text-sm text-white outline-none focus:border-ewa-orange/50"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publiées</option>
            <option value="draft">Brouillons</option>
          </select>

          {activeFiltersCount > 0 && (
            <button
              onClick={() => {
                setSearch("")
                setCategory("Tous")
                setLevel("Tous")
                setFormat("Tous")
                setStatusFilter("all")
              }}
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredCourses.map((course) => {
          const formatInfo = formatConfig[course.format]
          const FormatIcon = formatInfo.icon
          const completed = course.progress === 100
          const isExpanded = expandedCourse === course.id
          const youtubeId = extractYouTubeId(course.lessons[0]?.url)

          return (
            <div
              key={course.id}
              className="group relative flex flex-col rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] transition-all duration-300 hover:border-white/[0.15] hover:shadow-[0_8px_30px_rgba(255,107,26,0.06)]"
            >
              <div className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-16 w-28 rounded-lg object-cover"
                    />
                  ) : (
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] ${formatInfo.color}`}>
                      <FormatIcon className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex flex-col items-end gap-1">
                    {completed ? (
                      <span className="inline-flex items-center gap-1 rounded border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Terminé
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/50">
                        <Lock className="h-3 w-3" />
                        En cours
                      </span>
                    )}
                    <span
                      className={`rounded border px-2 py-0.5 text-[10px] font-medium ${
                        course.status === "published"
                          ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                          : "bg-white/10 text-white/60 border-white/20"
                      }`}
                    >
                      {course.status === "published" ? "Publiée" : "Brouillon"}
                    </span>
                  </div>
                </div>

                <div className="mb-1 flex items-center gap-2">
                  <span className={`rounded border px-2 py-0.5 text-[10px] font-medium ${levelConfig[course.level]}`}>{course.level}</span>
                  <span className="text-xs text-white/40">{course.format}</span>
                </div>

                <p className="mb-1 font-medium text-white">{course.title}</p>
                <p className="mb-4 line-clamp-2 text-xs text-white/40">{course.description}</p>

                <div className="mb-4 flex flex-wrap gap-1.5">
                  {course.tags.map((tag) => (
                    <span key={tag} className="rounded border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/50">
                      {tag}
                    </span>
                  ))}
                </div>

                {!completed && (
                  <div className="mb-4 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40">Progression</span>
                      <span className="text-white/60">{course.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/[0.08]">
                      <div
                        className="h-full rounded-full bg-ewa-orange transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 text-xs">
                  <div className="flex items-center gap-3 text-white/40">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <PlayCircle className="h-3 w-3" />
                      {formatLessonsCount(course.lessons)}
                    </span>
                  </div>
                  {renderStars(course.rating)}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/[0.06] bg-white/[0.02] px-5 py-3">
                <button
                  onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                  className="text-xs font-medium text-white/60 transition-colors hover:text-white"
                >
                  {isExpanded ? "Masquer" : "Voir les leçons"}
                </button>

                <div className="flex items-center gap-1">
                  {course.lessons[0]?.url && (
                    <a
                      href={course.lessons[0].url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white"
                      title="Ouvrir la vidéo"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    onClick={() => toggleStatus(course.id)}
                    className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white"
                    title={course.status === "published" ? "Dépublier" : "Publier"}
                  >
                    {course.status === "published" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => deleteCourse(course.id)}
                    className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-red-400/10 hover:text-red-400"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-white/[0.06] px-5 py-3">
                  <p className="mb-2 text-xs font-medium text-white/60">Leçons</p>
                  <div className="space-y-2">
                    {course.lessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[hsl(0_0%_10%)] px-3 py-2 text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-3.5 w-3.5 text-white/20" />
                          <span className="text-xs text-white/40">{index + 1}.</span>
                          <span className="text-white">{lesson.title}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white/40">{lesson.duration}</span>
                          {lesson.url && (
                            <a
                              href={lesson.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[11px] text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Voir
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-12 text-center">
          <GraduationCap className="mx-auto mb-3 h-10 w-10 text-white/20" />
          <p className="text-sm text-white/40">Aucune formation ne correspond aux filtres.</p>
        </div>
      )}

      <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-ewa-orange" />
          <h2 className="text-sm font-semibold text-white">Progression de l'équipe</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Formations publiées", value: stats.published },
            { label: "Formations démarrées", value: courses.filter((c) => c.progress > 0).length },
            { label: "Formations terminées", value: stats.completed },
            { label: "Taux d'engagement", value: "76%" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/[0.06] bg-[hsl(0_0%_10%)] p-4">
              <p className="text-xs text-white/40">{stat.label}</p>
              <p className="text-xl font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_10%)] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Nouvelle formation</h2>
              <button onClick={() => setIsCreateOpen(false)} className="rounded-lg p-1.5 text-white/40 hover:bg-white/[0.08] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Titre</label>
                <input
                  type="text"
                  value={newCourse.title || ""}
                  onChange={(e) => setNewCourse((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2 text-sm text-white outline-none focus:border-ewa-orange/50"
                  placeholder="Titre de la formation"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Description</label>
                <textarea
                  value={newCourse.description || ""}
                  onChange={(e) => setNewCourse((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2 text-sm text-white outline-none focus:border-ewa-orange/50"
                  rows={3}
                  placeholder="Description courte"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Catégorie</label>
                  <input
                    type="text"
                    value={newCourse.category || ""}
                    onChange={(e) => setNewCourse((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2 text-sm text-white outline-none focus:border-ewa-orange/50"
                    placeholder="ex: Montage"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Durée</label>
                  <input
                    type="text"
                    value={newCourse.duration || ""}
                    onChange={(e) => setNewCourse((prev) => ({ ...prev, duration: e.target.value }))}
                    className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2 text-sm text-white outline-none focus:border-ewa-orange/50"
                    placeholder="ex: 15 min"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Niveau</label>
                  <select
                    value={newCourse.level}
                    onChange={(e) => setNewCourse((prev) => ({ ...prev, level: e.target.value as CourseLevel }))}
                    className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2 text-sm text-white outline-none focus:border-ewa-orange/50"
                  >
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Format</label>
                  <select
                    value={newCourse.format}
                    onChange={(e) => setNewCourse((prev) => ({ ...prev, format: e.target.value as CourseFormat }))}
                    className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2 text-sm text-white outline-none focus:border-ewa-orange/50"
                  >
                    <option value="Vidéo">Vidéo</option>
                    <option value="Article">Article</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Atelier">Atelier</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">URL YouTube (optionnel)</label>
                <input
                  type="text"
                  value={newCourse.lessons?.[0]?.url || ""}
                  onChange={(e) =>
                    setNewCourse((prev) => ({
                      ...prev,
                      lessons: [{ id: "l1", title: prev.title || "Leçon 1", duration: prev.duration || "", url: e.target.value }],
                    }))
                  }
                  className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2 text-sm text-white outline-none focus:border-ewa-orange/50"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Tags (séparés par des virgules)</label>
                <input
                  type="text"
                  value={newCourse.tags?.join(", ") || ""}
                  onChange={(e) => setNewCourse((prev) => ({ ...prev, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) }))}
                  className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2 text-sm text-white outline-none focus:border-ewa-orange/50"
                  placeholder="Onboarding, EWA"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="status-published"
                  type="checkbox"
                  checked={newCourse.status === "published"}
                  onChange={(e) => setNewCourse((prev) => ({ ...prev, status: e.target.checked ? "published" : "draft" }))}
                  className="h-4 w-4 rounded border-white/[0.08] bg-[hsl(0_0%_13%)] text-ewa-orange focus:ring-ewa-orange"
                />
                <label htmlFor="status-published" className="text-sm text-white/70">Publier immédiatement</label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl border border-white/[0.08] bg-transparent px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.04]"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateCourse}
                className="rounded-xl bg-ewa-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ewa-orange/90"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
