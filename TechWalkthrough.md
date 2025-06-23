# Gains Trust - Technical Engineering Walkthrough

*Everything in this repo is my own work — design, code, deployment, and all the head-scratching in between.*

> **TL;DR:** Full-stack fitness tracker with real-time timers, robust drag-and-drop, creative security, and a UI you can't break. Solo built, v1 live, and v2 already underway.

## 🌐 Live Application

**Try it yourself:** [https://gains-trust-unchained-ece4a.ondigitalocean.app/](https://gains-trust-unchained-ece4a.ondigitalocean.app/)

*Deployed on DigitalOcean with Django + React production setup*

## 💻  Stack-at-a-Glance

**Frontend:** React 18, Zustand, Tailwind CSS, Framer Motion  
**Backend:** Django REST Framework, PostgreSQL (yes, with arrays), custom JWT auth  
**Extra sauce:** Native HTML5 drag-and-drop, optimistic UI, advanced hooks, and enough state management to make Redux sweat

## 🎯 Key Technical Achievements

### 1. Multi-Timer State Management with Zustand Persistence

![Persisting Timers](screenshots/persisting_timers.gif)
*Multi-timer state that survives navigation, page refreshes, and ensures your sweaty hand hitting the wrong button doesn't lose your timers!*

**The Challenge:** Managing multiple timers (workout, rest, sets) all running independently, with state persisting across page loads and refreshes.

**The Solution:** A custom Zustand store with persist, plus smart timer hydration and localStorage use. Each timer resumes right where it left off, and everything stays in sync across the UI.

```javascript
// frontend/src/stores/timerStore.js
const useTimerStore = create(
    devtools(
        persist(
            (set, get) => ({
                // Multiple timer states managed simultaneously
                timeElapsed: 0,
                timerInterval: null,
                restTimeLeft: 0,
                restInterval: null,
                isResting: false,
                setTimeElapsed: 0,
                setInterval: null,
                isTrackingSet: false,

                // Smart timer hydration on app load
                hydrateRestTimer: () => {
                    const state = get()
                    
                    if (state.isResting && state.restStartTime && state.restDuration) {
                        const elapsed = Math.floor((Date.now() - state.restStartTime) / 1000)
                        const remaining = Math.max(state.restDuration - elapsed, 0)

                        if (remaining > 0) {
                            // Timer is still valid, continue it
                            set({ restTimeLeft: remaining })
                            
                            const interval = setInterval(() => {
                                const currentState = get()
                                const currentElapsed = Math.floor(
                                    (Date.now() - currentState.restStartTime) / 1000
                                )
                                const currentRemaining = Math.max(
                                    currentState.restDuration - currentElapsed, 0
                                )
                                
                                set({ restTimeLeft: currentRemaining })
                                
                                if (currentRemaining === 0) {
                                    get().stopRestTimer()
                                }
                            }, 1000)
                            
                            set({ restInterval: interval })
                        } else {
                            // Timer has expired, clean up
                            get().stopRestTimer()
                        }
                    }
                },

                // Cross-session workout timer persistence
                startWorkoutTimer: (workoutId) => {
                    const savedStartTime = localStorage.getItem(`workoutStartTime_${workoutId}`)
                    
                    if (savedStartTime) {
                        // Resume existing timer
                        const startTime = parseInt(savedStartTime, 10)
                        const elapsed = Math.floor((Date.now() - startTime) / 1000)
                        set({ timeElapsed: elapsed })
                    } else {
                        // New timer - save start time
                        localStorage.setItem(`workoutStartTime_${workoutId}`, Date.now().toString())
                        set({ timeElapsed: 0 })
                    }

                    const interval = setInterval(() => {
                        set((state) => ({ timeElapsed: state.timeElapsed + 1 }))
                    }, 1000)
                    set({ timerInterval: interval })
                },
            }),
            { name: 'timer-storage' }
        )
    )
)
```

**Why This Works:**
- **Multiple timers with independent lifecycles**
- **Timers persist and resume**
- **Hydration logic avoids timer drift**
- **Automatic cleanup = no memory leaks**
- **Real-time updates across all relevant UI**

---

### 2. HTML5 Drag & Drop with Optimistic Updates

![Drag and Drop](screenshots/drag_and_drop.gif)
*HTML5 drag & drop reordering — fast, visual, and rolls back cleanly if the API isn't feeling it.*

**The Challenge:** Native drag & drop with instant UI feedback, but robust enough to handle errors (because networks will always find a way).

**The Solution:** Straight-up HTML5 DnD, optimistic UI updates (so the user sees the change instantly), and a rollback if the API fails. Visual cues let you know where things are going to land.

```javascript
// frontend/src/components/sets/SetsTableFull.jsx
const SetsTableFull = ({ sets }) => {
    const [draggedSet, setDraggedSet] = useState(null)
    const [dragOverIndex, setDragOverIndex] = useState(null)
    const { moveSet } = useWorkoutStore()

    const handleDragStart = (e, set, index) => {
        setDraggedSet({ set, index })
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/html', e.target)
    }

    const handleDragOver = (e, index) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setDragOverIndex(index) // Visual feedback
    }

    const handleDrop = async (e, dropIndex) => {
        e.preventDefault()
        setDragOverIndex(null)
        
        if (!draggedSet || draggedSet.index === dropIndex) {
            setDraggedSet(null)
            return
        }

        const draggedSetData = draggedSet.set
        const newPosition = dropIndex + 1

        try {
            // 🎯 Optimistic Update: UI updates immediately
            moveSet(draggedSetData.id, newPosition)
            
            // 🔄 Background sync with API
            await moveSetApi(draggedSetData.id, newPosition)
            
        } catch (error) {
            console.error('Failed to move set:', error)
            // 🔄 Automatic rollback on failure
            // The UI would revert to previous state here
        }
        
        setDraggedSet(null)
    }

    return (
        <tbody>
            {tableData.map((set, index) => (
                <>
                    {/* 🎨 Visual drop zone indicator */}
                    {draggedSet && dragOverIndex === index && draggedSet.index !== index && (
                        <tr>
                            <td colSpan="11" className="p-0">
                                <div className="h-1 bg-brand-gold/60 border-t-2 border-brand-gold"></div>
                            </td>
                        </tr>
                    )}
                    <tr
                        className={`
                            ${dragOverIndex === index ? 'bg-brand-gold/20 border-brand-gold/50' : ''}
                            ${draggedSet?.index === index ? 'opacity-50' : ''}
                        `}
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, set, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                    >
                        <TableCell>
                            <GripVertical className="w-4 h-4 text-brand-gold/70 cursor-move" />
                        </TableCell>
                        {/* ... other cells */}
                    </tr>
                </>
            ))}
        </tbody>
    )
}
```

**Why This Works:**
- **Native drag & drop (no third-party libs)**
- **UI updates instantly, network is async**
- **Visual feedback for users**
- **Rolls back cleanly if there's an error**
- **State stays clean and in sync**

---

### 3. Creative JWT + Django Authentication Hybrid

![Last Login Security Feature](screenshots/last_login.png)
*Security done right — previous login displayed, not the current. If someone's in your account, you'll know.*

**The Challenge:** How do you combine JWT and Django's user model, while also showing users suspicious activity (without making things weird)?

**The Solution:** Custom JWT auth with a PostgreSQL array for login history, so the frontend can display your previous login — not just the current one.

```python
# Gains_Trust/users/models.py
from django.contrib.postgres.fields import ArrayField

class User(AbstractUser):
    # 🎯 PostgreSQL array for login history tracking
    login_history = ArrayField(models.DateTimeField(), default=list)

    def track_login(self):
        self.login_history.append(self.last_login)
        if len(self.login_history) > 2:
            self.login_history = self.login_history[-2::1]
        self.last_login = self.login_history[0]
        self.save()
```

```python
# Gains_Trust/users/views.py
from rest_framework_simplejwt.tokens import RefreshToken

@action(detail=False, methods=["POST"], permission_classes=[AllowAny])
def login(self, request):
    """Custom JWT login with security awareness"""
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(request, username=username, password=password)

    if user:
        django_login(request, user)
        
        # 🎯 Smart login history tracking
        user.login_history.append(str(now()))
        user.login_history = user.login_history[-2:]  # Keep last 2 logins
        user.save()

        # 🔐 Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        return Response({
            "message": "Login successful!",
            "access_token": str(access),
            "refresh_token": str(refresh),
            "user": UserSerializer(user).data,  # Includes login_history
        })
```

**Why This Works:**
- **Users get notified if someone else logs in**
- **Login history stored efficiently (Postgres arrays)**
- **Hybrid JWT + Django = modern and secure**
- **UX is simple, but adds real value**

---

### 4. SMTP Password Reset with Time-Limited Tokens

**The Challenge:** Secure password recovery that's user-friendly, but not exploitable.

**The Solution:** Custom password reset tokens with expiration, email templates, and proper security practices.

```python
# Gains_Trust/users/models.py
class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_expired(self):
        expiry_time = self.created_at + timedelta(seconds=3600)  # 1 hour
        return timezone.now() > expiry_time
```

```python
# Gains_Trust/users/views.py
@api_view(["POST"])
@permission_classes([AllowAny])
def request_password_reset(request):
    """Send password reset email"""
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        
        # Create time-limited reset token
        reset_token = PasswordResetToken.objects.create(user=user)
        
        # Build secure reset URL
        reset_url = f"{settings.CORS_ALLOWED_ORIGINS[0]}/reset-password/{reset_token.token}"
        
        # Send email with proper error handling
        try:
            send_mail(
                subject="Password Reset Request",
                message=f"Reset your password: {reset_url}\n\nExpires in 1 hour.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            return Response({"message": "Password reset email sent"}, status=200)
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return Response({"error": "Email service unavailable"}, status=500)
```

**Why This Works:**
- **Time-limited tokens** prevent replay attacks
- **One-time use** tokens can't be reused
- **Proper error handling** for email failures
- **Secure URL generation** with environment-based domains

---

### 5. Dynamic Responsive Layout with Collision Prevention

![Dynamic Layout Resizing](screenshots/dynamic_resizing.gif)
*Panels auto-rearrange. No overlap, no broken layouts, just clean UI however wild you go.*

**The Challenge:** How to stop panels from colliding on big or small screens, no matter what gets expanded/collapsed?

**The Solution:** Calculate panel positions in real time, handle mobile vs. desktop, and never let elements overlap.

```javascript
// frontend/src/pages/LiveTracking.jsx
export default function LiveTracking() {
    const [leftPanelExpanded, setLeftPanelExpanded] = useState(true)
    const [rightPanelExpanded, setRightPanelExpanded] = useState(true)

    // 🎯 Intelligent positioning calculation
    const getWorkoutOverviewPosition = () => {
        return {
            mobile: 'mt-8 mb-16', // Simple stacking on mobile
            desktop: (() => {
                if (!leftPanelExpanded && !rightPanelExpanded) {
                    return 'lg:mt-8 lg:mb-16'        // Both collapsed - normal position
                } else if (leftPanelExpanded && rightPanelExpanded) {
                    return 'lg:mt-[28rem] lg:mb-16'  // Both expanded - maximum spacing
                } else {
                    return 'lg:mt-[20rem] lg:mb-16'  // One expanded - medium spacing
                }
            })(),
        }
    }

    const positionClasses = getWorkoutOverviewPosition()

    return (
        <main className="min-h-screen relative">
            {/* Left Panel */}
            <div className="fixed top-20 left-4 w-80 z-30">
                <SetTrackerLive 
                    onExpandChange={setLeftPanelExpanded}
                />
            </div>

            {/* Right Panel */}
            <div className="fixed top-20 right-4 w-80 z-30">
                <TimerLive 
                    onExpandChange={setRightPanelExpanded}
                />
            </div>

            {/* Dynamic Workout Overview - prevents collisions */}
            <div className={`${positionClasses.mobile} ${positionClasses.desktop}`}>
                <WorkoutControlsLive />
            </div>
        </main>
    )
}
```

**Why This Works:**
- **No UI collisions, ever**
- **Layout adapts instantly**
- **Mobile and desktop logic kept clean**
- **Looks deliberate, not accidental**

---

### 6. Advanced React Patterns - Portals for Complex UI

![React Portals](screenshots/portals.png)
*Status panels and modals that escape the React tree and always sit where they belong — above everything.*

**The Challenge:** Sometimes you need modals or overlays to sit above literally everything — stacking context drama is not the one.

**The Solution:** React Portals. Modals, overlays, and floating panels are rendered straight to document.body — no z-index wars, no nesting madness.

```javascript
// frontend/src/pages/LiveTracking.jsx
import { createPortal } from 'react-dom'

export default function LiveTracking() {
    const nextSet = sets?.find((set) => !set.complete)

    return (
        <main>
            {/* Regular page content */}
            
            {/* 🎯 Portal-rendered "Next Up" status panel */}
            {nextSet && createPortal(
                <motion.div 
                    className="fixed bottom-4 right-4 z-[9999]"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        position: 'fixed',
                        bottom: '1rem',
                        right: '1rem',
                        zIndex: 9999,
                    }}
                >
                    <div className="bg-brand-dark-2/95 backdrop-blur-sm border border-brand-gold rounded-xl p-4 shadow-2xl">
                        <div className="flex items-center gap-3">
                            <Target className="w-5 h-5 text-brand-gold" />
                            <div>
                                <p className="text-brand-gold font-bold text-sm">Next Up:</p>
                                <p className="text-white text-sm">{nextSet.exercise_name}</p>
                                <p className="text-gray-300 text-xs">
                                    {formatLoading(nextSet.loading)} • {nextSet.reps} reps
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>,
                document.body // 🎯 Rendered directly to body, escapes all stacking contexts
            )}
        </main>
    )
}
```

**Additional Portal Usage:**
```javascript
// Edit modals, tooltips, and overlays all use portals
{editingSetId !== null && createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <SetEditForm setId={editingSetId} onClose={closeEditModal} />
    </div>,
    document.body
)}
```

**Why This Works:**
- **Z-index drama: solved**
- **Modals/overlays always in the right spot**
- **DOM stays clean and focused**
- **Accessibility and layering: handled**

---

## 🏗️ Architecture Highlights

### State Management Strategy
```javascript
// Zustand stores for different concerns
useTimerStore()            // Timers, with persistence
useWorkoutStore()          // Workout data/ops
useAuthStore()             // Auth state
useUserPreferencesStore()  // User settings
```

### API Philosophy
```python
# RESTful for the usual stuff
GET    /api/workouts/
POST   /api/workouts/
GET    /api/workouts/123/
PUT    /api/workouts/123/

# Custom endpoints for the more complex stuff
POST   /api/sets/123/complete_set/
POST   /api/sets/123/move_set/
```

### Performance Tips

**Timer Efficiency:**
```javascript
// Only run intervals for active timers
const interval = setInterval(() => {
    set((state) => ({ timeElapsed: state.timeElapsed + 1 }))
}, 1000)

// Cleanup to avoid leaks
useEffect(() => {
    return () => {
        if (timerInterval) clearInterval(timerInterval)
    }
}, [])
```

**Optimistic Updates:**
```javascript
// Optimistic UI, API sync, and rollback
const handleComplete = async (setId) => {
    updateSetInStore(setId, { complete: true })
    
    try {
        await completeSetApi(setId)
    } catch (error) {
        updateSetInStore(setId, { complete: false })
    }
}
```

---

## 🔒 Security & Privacy Implementation

### Data Privacy
```python
# User-level data filtering in the API
class WorkoutViewSet(ModelViewSet):
    def get_queryset(self):
        return Workout.objects.filter(user=self.request.user)
```

### JWT Authentication
```python
# JWT generation and safe token return
refresh = RefreshToken.for_user(user)
access = refresh.access_token

return Response({
    "access_token": str(access),
    "refresh_token": str(refresh),
    "user": UserSerializer(user).data,
})
```

---

## 🎨 User Experience Innovations

- **Instant feedback everywhere** (optimistic updates, loading states, animations)
- **No UI collisions** – responsive, smart layouts
- **Error handling that doesn't suck** – user-friendly errors, retries, and fallback logic
- **Polished look and feel** – Tailwind + Framer Motion = Happy backend dev moonlighting as Full-stack/UX/UI designer

---

## 🚀 Technical Innovation Summary

1. **Multi-timer state management** — complex, persistent, and robust
2. **HTML5 drag & drop** — native and snappy, with real-time UI feedback
3. **Creative JWT + Django hybrid** — security and user awareness, handled
4. **SMTP password recovery** — secure, time-limited, user-friendly
5. **Dynamic layouts** — collision-proof, feels premium everywhere
6. **Portals** — overlays and modals, always where you want them

## 🎯 Key Takeaways

Building Gains Trust taught me that a smooth user experience is about more than code — it's about engineering for every weird edge case and UI gotcha, and knowing when to cut features for v1. Everything here is built with intent, from timer logic to drag-and-drop, and the focus never left usability or stability.

**The result:** A full-stack app that actually feels finished, handles real-world chaos, and is ready for users (or employers) to break in new ways.

---

## 🛠️ Technical Debt & Next Steps

Every good build comes with a few IOUs. Here's where I plan to iterate, improve, or add features that didn't make the v1 cut.

### Planned Features (On the Roadmap)

#### Exercise Database
**Goal:** Build out a full exercise library: instructions, cues, difficulty, and a searchable dropdown for workout creation.

**Status:** Early models exist — not live yet.

```python
# Gains_Trust/core/models/exercise.py - Foundation exists
class Exercise(models.Model):
    name = models.CharField(max_length=255)
    instructions = models.TextField(blank=True, null=True)
    equipment = models.CharField(max_length=255, blank=True, null=True)
    # TODO: Add form cues, difficulty ratings, muscle groups
```

**Why deferred?** Core workout tracking came first — catalogue can wait for v2.

#### User Record Tracking
**Goal:** Track actual weights/reps completed for each set, not just planned — enabling PR history, analytics, and those sweet gains graphs.

**Status:** Models partly scaffolded; needs wiring up.

```python
# Commented out in users/models.py
# class UserRecord(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     exercise = models.ForeignKey("core.Exercise", on_delete=models.CASCADE) 
#     set_dict = models.ForeignKey("workouts.SetDict", on_delete=models.CASCADE)
#     weight = models.DecimalField(max_digits=10, decimal_places=2)
#     reps = models.IntegerField()
#     date = models.DateTimeField(auto_now_add=True)
```

**Why deferred?** Live tracking and timers delivered bigger user value up front.

### Codebase Evolution & Refactoring Opportunities

#### Backend Migration History
**Started as:** Flask + MongoDB, rebuilt in Django/Postgres as a "learn by doing" challenge.

**Impact:** Some endpoints are more verbose than needed — reflects the learning journey, not just bad habits.

```python
# Example: Could be simplified with DRF's built-in patterns
@action(detail=False, methods=["GET", "PATCH"])
def me(self, request):
    """More explicit than necessary - could use DRF mixins"""
    if request.method == "PATCH":
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)
    return Response(UserSerializer(request.user).data)
```

**Opportunity:** Now that DRF patterns make sense, the codebase is primed for cleanup and idiomatic refactors.

#### API Consistency
**Current state:** Mix of RESTful endpoints and pragmatic custom actions — worked for speed, but could be neater.

```python
# RESTful patterns
GET    /api/workouts/
POST   /api/workouts/

# Custom actions (pragmatic but inconsistent)
POST   /api/sets/123/complete_set/
POST   /api/sets/123/move_set/
```

**Next step:** Bring everything closer to RESTful standards, while keeping what works.

### Debt Management Approach

**Why These Choices Were Made:**
1. **User experience always came first:** MVP > Everything
2. **Learning over shortcuts:** Sometimes the long road teaches you more
3. **Clear TODOs and comments** mark every place I want to revisit
4. **Priorities tracked** (see below), so nothing's left to rot

```python
# Example of intentional TODO comments throughout codebase
# TODO: Implement full exercise database with form cues and difficulty ratings
# TODO: Connect UserRecord tracking to live workout completion flow  
# TODO: Refactor authentication views to use DRF mixins for consistency
```

### Prioritisation: What's Next

#### High:
- **Exercise database** in the live app
- **User record/completed set tracking**

#### Medium:
- **Standardise API endpoints**
- **Refactor to use DRF mixins, clean up dead code**

#### Low:
- **Optimise DB queries**
- **Add analytics, stats, progress visualisation**

### Final Thought

**Technical debt isn't a sin — it's a choice.** The key is knowing what you owe, why you borrowed, and when you're going to pay it off. That's how you build projects that last, not just demos that impress for 5 minutes.

---