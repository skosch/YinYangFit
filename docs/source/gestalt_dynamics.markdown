<a name="grouping-border-ownership"></a>

## Grouping and border ownership

Consider that navigating our natural environment requires us to correctly
identify three-dimensional objects in three-dimensional space. But the shape of
these objects varies heavily depending on perspective—after all, we only see a
two-dimensional projection of reality—and is available to our brain only as a collection of
the abovementioned V4 contour fragments. What's more, the contour detectors will
activate on *both sides* of each object, like so:

{mn}Two V4 contour detectors, tuned to the same eccentricity, angle, and
curvature, activate in response to a dark blob shape. One of them (shown in red)
is centered on the object as expected, the other is centered outside. Many
(though not all) of these detectors are connected mainly to V1 complex cells, rendering
them more responsive to the sheer presence of an edge than to its contrast polarity.{/mn}
<img src="img/v4_rf_outside.png" alt="activation of V4 contour receptor on outside">

How can we recognize a half-occluded object, discount its perspective foreshortening and assign it a
relative depth, relying only on a population of V4 contour detectors, half of
which are gratuitously detecting the objects' outsides? The solution lies in the
key feedback loops that enable perceptual grouping.

The first feedback loop connects V4 with a special class of V2 neurons called
*border ownership cells* or B-cells. These B-cells, like the V2
contour-integrating cells already discussed, detect the presence of edges based
on the activity of V1 complex cells. As expected, they are agnostic to the edge's
contrast polarity. But surprisingly, B-cells fire only if they are centered on one particular side of an
object. For instance, the B-cell whose receptive field is marked in red below
only detects edges on the *left side* of objects, as indicated here by the small
protrusion pointing toward the right.{sn}Almost everything we know about border
ownership networks is owed to Johns Hopkins researcher Rüdiger von der Heydt and
his students. His <nobr>[2015 review](https://doi.org/10.3389/fpsyg.2015.01695)<span class="oa" title="Open
Access"></span></nobr> summarizes the key findings well.{/sn}

{mn}Here, the B-cell responds to stimuli 1 and 2, but not 3 and 4.{/mn}
<img src="img/b_cell_1.png" alt="B cell illustration">

This is remarkable. After all, the B-cell only sees a single edge. It cannot
know which part of the object it is on; its receptive field is much too small.
So its activity must be gated by a neuron which does: namely, one of our
higher-level V4 neurons.{sn}Lateral inhibition from other V2 neurons cannot
explain this behaviour, because horizontal connections conduct <nobr>[too
slowly](https://dx.doi.org/10.1152%2Fjn.00928.2010)<span class="oa" title="Open
Access"></span></nobr> to explain the lab-measured response times of B-cells, so
dedicated connections to a particular V4 cell are the most plausible
explanation.{/sn} The object owning the edge fragment could have any shape and
size, so *all* active V4 neurons whose contour templates coincide with the edge
fragment send amplifying signals to our B-cell. In turn, our B-cell directly
contributes to their activation, establishing a positive feedback loop:

<img src="img/bg_feedback_0.png" alt="B-cell feedback loop">

There is an entire population of such B-cells distributed across V2's
retinotopy. For instance, consider a right-side B-cell (blue below)
neighbouring our left-side B-cell. Both B-cells are engaged in
feedback loops with V4 neurons while simultaneously inhibiting local
competitors—i.e., each other—in proportion to their own activation
strength (recall our discussion of lateral inhibition in V1):

<img src="img/bg_feedback_1.png" alt="B-cell feedback loop">

If the interior (red) V4 cells now were to fire more strongly than the exterior (blue)
ones, then the inward-pointing (red) B-cells would quickly inhibit the
outward-pointing (blue) ones, firmly establishing that the border belongs to an object
on the right. What would cause the interior (red) V4 cells to dominate?

Research suggests that higher-level cells, perhaps in the lateral-occipital
complex (LOC), respond to combinations of V4 contour-detecting neurons centered on the
same retinal location. Such cells effectively group together the borders owned
by an object, and are therefore called G-cells.

{mn}Here, the G-cell is shown as a blurred circle around a center. The blurred
circle corresponds to the location of contours that this G-cell responds to.{/mn}
<img src="img/bg_feedback_2.png" alt="B-cell feedback loop">

Because the external (blue) B-cells and V4 contour signals do not combine to
excite a higher-level G-cell, they do not receive positive feedback, and lateral
competition (between B-cells, and likely also between V4 and G-cells) quickly silences them.

The exact receptive field of each G-cell is likely quite unique, but a popular
approach is to assume that they are circular:{sn}Readers should keep in mind
that *"all models are wrong, some are useful"* applies to this entire article,
but to the concept of B-cells and G-cells in particular.<br/>The first to run a
simulation of the G-cell idea in earnest were <nobr>[Edward Craft et
al.](https://doi.org/10.1152/jn.00203.2007)<span class="oa" title="Open
Access"></span></nobr> in 2011.{/sn}

<img src="img/bg_rfs.png" alt="Receptive fields of G cells">

This means that the square in the example above would strongly activate a circular G-cell
in the center, which takes input from V4 contours on all four sides of the
square, and somewhat less strongly activate the circular G-cells along the
square's diagonals, which take input from two sides of the square:

<img src="img/g_responses.png" alt="Sample responses of some G cells">

### G-cells skeletonize shapes
Once B-cells and G-cells have settled into an equilibrium, the locus
of peak responses of G-cells across different scales neatly represents
the skeleton of the shape, shown on the right:{sn}The technical term for this feat is
[medial axis transform](https://en.wikipedia.org/wiki/Medial_axis)<sup>W</sup>.{/sn}

<img src="img/g_responses_skeleton.png" alt="Sample responses of some G cells,
forming a skeleton">

This skeletonization step is critical to object recognition. It translates a
shape's contour fragments into its underlying geometric structure in a way that
is very robust to perspective distortions.{sn}And indeed, the inferotemporal
neurons in macaque monkeys appear to respond to skeleton fragments, such that a
small population of such neurons suffices to represent a variety of complicated
3D shapes, as Chia-Chun Hung and colleagues have
<nobr>[demonstrated](https://doi.org/10.1016/j.neuron.2012.04.029)<span class="oa" title="Open
Access"></span></nobr>.{/sn} Conveniently,
this ability translates directly to letter recognition. Consider, for instance,
our ability to recognize the following four styles of uppercase *E* with the
same ease:

{mn}Many different uppercase-E designs exist, but all of them share a
relationship between the relative locations of large-scale G-cell peaks (within
the counters) and smaller-scale peaks (at the terminals). Note that this
illustration is tremendously simplified, as it does not take into account competition at the level of B-cells.{/mn}
<img src="img/e_skeletons.png" alt="Some skeletons at different scales">

Although the shared features of the skeletons (counters, stems, etc.) appear at
different scales for different letter shapes, they are present in the same
configuration for all of them. This is true even for letters that are outlined
(last row), as V4 contour detector neurons respond primarily to the contour, not
to the fill (or the absence of fill).

We can push the G-cell model to its limits by looking at different font weights:

<img src="img/letter_weights.png" alt="A range of letter weights">

Arguably, hairline letters are too thin to allow readers to clearly perceive
border ownership of the left and right side of each stem (counter-centered
G-cells could still be active).{sn}Of course this depends on the font size and
the contrast sensitivity function, as discussed earlier.{/sn} It is quite
possible that our brain solves this problem by dedicating specialized cells in
V4 and beyond to detect elongated, fine lines,{sn}See e.g. <nobr>[this 2018
discovery](https://doi.org/10.1016/j.neuron.2018.03.009)<span class="oa"
title="Open Access"></span></nobr> of acuity-preserving neural clustering by
Yiliang Lu et al.{/sn} complementing the skeleton-based representation.{sn}As in
<nobr>[this 2017
simulation](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5693639/)<span
class="oa" title="Open Access"></span></nobr> of contour G-cells by Brian Hu et
al.{/sn} For the purposes of our letterfitting model, however, such
considerations are unlikely to be required. Because the receptive fields of our
model V4- and G-cells can be made arbitrarily small, we will assume here that
the idealized labour division between B- and G-cells is universal.

The fact that G-cells are presumed to interact with circularly-arranged
populations of contour detectors, thus skeletonizating shapes, aligns neatly
with the Gestalt principle of convexity: after all, it is circular shapes that
are most easily perceived as coherent objects, while more concave contours add
visual complexity at the expense of *prägnanz*. Of course, the preference for
convex shapes would not be possible if V4 contour detectors were not also
overwhelmingly tuned for convex contour fragments.{sn}As we know they are,
thanks to studies like
<nobr>[this one](https://doi.org/10.1152/jn.2001.86.5.2505)<span class="oa" title="Open
Access"></span></nobr> and <nobr>[this
one](https://doi.org/10.1152/jn.01265.2006)<span class="oa" title="Open
Access"></span></nobr>, again by Anitha Pasupathy and
colleagues.{/sn} Meanwhile, the Gestalt principle of proximity is explained by
the fact that G-cells with smaller receptive fields tend to outcompete larger
ones.

### Competitive contour integration along T-junctions
Before we discuss how this perceptual grouping plays out across letter pairs and
entire words, one more phenomenon should be mentioned for completeness' sake.
Consider the following situation:

<img src="img/gestalt_1.png" alt="Gestalt B-cell 1">

Here, the circle is perceived to be in front of, and overlapping, the dark
shape. We intuitively assume that the dark shape continues with a straight edge
behind the circle, and also that it continues beyond the edges of the image, as
if the scene were seen through a window.

<img src="img/gestalt_2.png" alt="Gestalt B-cell 2">

The T-junctions created by overlapping shapes activate three sets of convex
contour detectors, illustrated here in red, blue, and green. Experiments suggest
that between such configurations of contour detectors, it is the straight,
continuous one (here in red) that inhibits the other two.{sn}See
<nobr>[here](https://doi.org/10.1523/JNEUROSCI.4766-10.2011)<span class="oa" title="Open
Access"></span></nobr> for a painstaking study
of these effects by Brittany Bushnell et al. from the Pasupathy lab.{/sn} As a
result, the border ownership at the T-section is assigned to the circle, while
the contours of the dark shape disappear near the corners. A similar effect
takes place at the edges of the scene. {mn}<img src="img/kanisza.png"
alt="kanisza"><br/> Both effects combine in the classic
[illusions](https://en.wikipedia.org/wiki/Illusory_contours)<sup>W</sup> by Gaetano Kanizsa,
in the square, which is evoked mainly through its skeleton at the corners,
creates T-junctions with the flankers that are invisible yet strong enough to
determine relative depth.{/mn} Now, contour-integrating cells in V2 and V4 are
at liberty to connect the loose ends via a straight edge, in collaboration with
G-cells that encode the likely skeleton of the dark shape. We thus perceive the
dark shape as the corner of a rectangle of indeterminate size. In addition, the
T-junctions contribute to the depth perception that layers the two objects—but
this is less relevant to perceptual grouping.

### Symmetry
{mn}<img src="img/symmetry.png" alt="symmetry example"><br>Symmetry maximization
may contribute to some letterfitting decisions. Even if not the entire triplet
is symmetrical, local symmetry may be a factor in Gestalt perception.{/mn}
*Symmetry* is one concept that often comes up in this context, perhaps mostly
thanks to a popular letterfitting strategy that involves triplets of letters. In
this strategy, triplets are chosen such that one pair has already been fitted
and remains fixed, and the other is then adjusted to match. For many such
triplets, it intuitively seems that the letterfitting decisions are driven by
the perception of symmetry around the middle letter.

Although the exact neural mechanisms for symmetry perception are still under
much debate, the prevalent idea is that dedicated symmetry detectors in LOC
respond to correlations between the object-centered eccentricities and
curvatures signalled by V4 contour detectors, whether via positive feedback or
via inhibition circuits, or perhaps both.{sn}The [2010
model](https://doi.org/10.1167/10.1.9) by Frédéric Poirier and Hugh Wilson is
quite representative of the literature, even though some of the details are
perhaps questionable.{/sn} Needless to say, the axis of symmetry must coincide
with medial axis skeletons; it seems very plausible that LOC's purpose of
detecting correlations between V4 neurons would extend beyond G-cells to 
symmetry detectors.

The triplet's fixed pair provides context that isn't available in pairwise
fitting. This makes triplet-based fitting a great strategy for human designers.
Unfortunately, symmetry detection requires more complicated models compared to
the relatively simple ring-like structures corresponding to G-cells, and it is
not quite clear how they would interact with activated G-cells. 

For these reasons, we will stick to a simpler pairwise model for now.
Nevertheless, symmetry detection could be explored in future models.

<a name="attention-crowding"></a>

## Attention and crowding
In Gestalt-based letterfitting, the objective is for attention to spread
evenly from each letter to its neighbours both left and right. We now have the
models, however crude, to think about how this happens.

Raw visual input alone would be enough to excite neurons throughout the visual
cortex, but the many feedback connections throughout the cortex lead to much
more complex behaviour. Positive feedback loops cause neurons to go into
overdrive. Meanwhile, inhibitive connections keep such boosted activity
localized, to prevent it from getting out of control. Over time, these clusters
of heightened activity spread out, shift around, die out, and then start anew
elsewhere. This is attention.

{mn}In this oversimplified network, activity is first propagated forward, and
establishes a stable pattern thanks to feedback connections and lateral
inhibition. By adding top-down activity, we can shift the pattern around and
thus change which parts of the image are "loudest", or "in focus", in our
perception: this is attention.{/mn} <img src="img/attention_spread_network.png"
alt="how attention might spread in a network" />

Some image features naturally stand out from others that are suppressed (e.g.
via surround suppression) and thus command attention exogenously. This depends
on the movement of our gaze. But we can also intentionally exert attention, by
injecting top-down activity into certain positive feedback loops.{sn}By which I
merely mean "the activity originates in frontal-lobe areas", without endorsing
any Cartesian notions of dualism.{/sn} Just as we can move our arm by injecting
neural activity into particular motor neurons, so we can "light up" certain
parts of the image by injecting, for instance, additional activity into the
respective G-cells.{sn}For a simulation of how this might play out between
G-cells and V1, take a look at Stefan Mihalaş et al.'s <nobr>[2011
paper](https://doi.org/10.1073/pnas.1014655108)<span class="oa" title="Open
Access"></span></nobr>.{/sn} This reinforces the associated feedback loops and
helps inhibit neighbouring neurons laterally.{sn}The attention-selected V1 and
V2 neurons, of course, have connections to many brain regions besides V4. This
had led cognitive scientists to call the early visual cortex a <nobr>["cognitive
blackboard"](https://doi.org/10.1146/annurev-vision-111815-114443)<span
class="oa" title="Open Access"></span></nobr>.{/sn}

### Perceptual grouping is spreading neural activity
Objects are grouped together perceptually when attention spreads easily between them.

Consider first how neural activity spreads within a single letter, due to feedback from the
contour integrators in V2 and V4 and the G-cells in LOC. As contour integrators
are tuned to collinearity, activity spreads most readily up and down stems and
horizontals (1):

<img src="img/activity_spread.png" alt="illustration of spreading neural activity">

Then, thanks to the feedback from G-cells, activity anywhere along convex
structures amplifies V1–V4 signals along that entire convex structure (2). This
creates feedback loops that make round counters (especially closed counters,
like a lowercase *o*) particularly stable attractors{sn}Here, the term
[attractor](https://en.wikipedia.org/wiki/Attractor)<sup>W</sup> refers to
region of stability in a dynamical system.{/sn} of neural activity.

Next, consider how adding a neighbouring letter opens up new avenues for
attention to spread between them. If the tow letters are close enough, collinear
integration feedback bridges the letters along the baseline and x-height (3),
especially when serifs or crossbars are present. Furthermore, G-cells in the gap
between the letters now receive enough input to begin firing a little, providing
another path for activity to spread from letter to letter (4).

But of course, the receptive field size of collinear contour integrators is
limited, and the G-cells have to compete (with one another, and via B-cells)
with the G-cells representing the individual letters.{sn}As mentioned,
smaller-scale G-cells are generally presumed to outcompete larger-scale ones, in
line with the Gestalt law of proximity.{/sn} In practice, this means that the
potential for perceptual grouping is directly correlated to the proximity of the
two letters.

Having come this far, we can revisit the illustration from above and better understand
how "balance between letter pairs" is a question of perceptual grouping mediated
by the spread of neural activity (and the inhibition of same):

<img src="img/grouping_relativity.png" alt="Illustration of the importance of consistency of fit vs absolute distances.">

We can now also understand why pairs of round counters (e.g. *oo*) require a
tighter fit: it's because round counters do not provide much opportunity for
collinear contour integration along the baseline or x-line, and their respective
G-cells maintain strong, stable feedback loops that tend to inhibit new G-cell
activations in the gap (which would facilitate grouping).

### Crowding and grouping
To put these ideas into context, let's briefly look at how the spread of neural
activity can actually *prevent* us from reading text. This phenomenon, called *crowding*, 
has captured the fascination of cognitive scientists since the 1970s.

In the following illustration, it is very difficult to make out the uppercase *V*
while focusing on the center cross, even though recognizing the left-hand *A*,
which is exactly the same distance away, is no problem.

<img src="img/crowding_example.png" alt="Example of crowding between letters">

What seems to happen is that the texture-detecting neurons in V2 and
V4 hijack the positive feedback loops and outcompete the contour-detecting
cells that would allow us to recognize the letter. However hard one might try to attend to the *V*,
any top-down attention is simply diverted into the texture representation of the image.

The severity of crowding increases with the distance from the fovea, as the
periphery contains more, and much larger, texture-detecting neurons.{sn}As a
rule of thumb, the spacing needs to be at least half the eccentricity, i.e. to
the distance from the fovea (see Herman Bouma's [1970
report](https://doi.org/10.1038/226177a0)).{/sn} Crowding is also made worse by
regularity in the spacing of the flanking objects;{sn}As <nobr>[demonstrated in
2010](https://doi.org/10.1167/10.10.17)<span class="oa" title="Open
Access"></span></nobr> by Toni Sareela et al.{/sn} again, presumably, because
periodicity strengthens texture perception.

The idea that crowding and perceptual grouping are two sides of the same
coin—namely, the spreading of activity across neural populations—is a
surprisingly recent but nevertheless very convincing one.{sn}Michael Herzog's
group at EFPL were the first to strongly advocate for it; see <nobr>[this
review](https://dx.doi.org/10.1167%2F15.6.5)<span class="oa" title="Open
Access"></span></nobr> for a great summary of the evidence.{/sn} Indeed, among
the many recent computational models of crowding, there is only which reliably
predicts what human subjects perceive: namely, the model that simulates crowding
as perceptual grouping.{sn}See <nobr>[Doerig et al.,
2019](https://doi.org/10.1371/journal.pcbi.1006580)<span class="oa" title="Open
Access"></span></nobr>, for a comparison of approaches, and [Francis et al.,
2017](http://dx.doi.org/10.1037/rev0000070)<sup>[PDF](https://whitneylab.berkeley.edu/PDFs/Francis_Manassi_2017.pdf)</sup>
and <nobr>[Bornet et al., 2019](https://doi.org/10.3389/fnbot.2019.00033)<span
class="oa" title="Open Access"></span></nobr>, for the grouping-based model.
Also check out <nobr>[their attempt](https://doi.org/10.1101/747394)<span
class="oa" title="Open Access"></span></nobr> to reproduce the effect in capsule
networks.{/sn}

### Summary
At this point, let's recapitulate what happens to the image of letters on a
page:

1. In a forward sweep from V1 to V4, edges and
lines in V1 activate contour-integrating V2 neurons (mostly in the fovea and
parafovea) and texture-detecting V2 neurons (mostly in the periphery). These, in
turn, activate V4 neurons that detect more complex visual patterns, among them
convex contour fragments.

2. As these V4 signals begin to excite higher-level
brain areas, feedback signals from V2 to V1 and from V4 to V2 begin to rapidly
reinforce spatially integrated patterns (mainly contours).

3. Surround-suppressive feedback mutes spatially redundant signals, allowing
boundaries to pop out between textured surfaces even in the absence of strong
contour signals.

4. Lateral inhibition between neurons further prevents activity from spreading, 
as more active neurons can dampen their neighbours. Because signals travel more
slowly through intracortical horizontal connections, lateral inhibition takes a
bit longer to kick in fully.

5. Top-down attention exerted on individual (or small populations of) high-level
   neurons shifts the dynamics of the entire network. A little bit of attention
   can go a long way.{sn}Thomas Miconi and Rufin VanRullen [describe
   how](https://doi.org/10.1109/CIMSIVP.2011.5949241)<sup>[PDF](https://hal.archives-ouvertes.fr/hal-00706798/file/miconi_t_11_106.pdf)</sup>
   a little bit of extra activity can effectively shift the entire receptive field of
   a neuron. In Stefan Mihalaş et al.'s <nobr>[2011
   simulations](https://doi.org/10.1073/pnas.1014655108)<span class="oa" title="Open
Access"></span></nobr>, referenced above,
   increasing G-cell activity by a mere 7% was enough to reproduce the effects
   seen in human subjects.{/sn}

6. As neural activity travels outwards along contours and textures, some regions (retinotopic,
   not cortical) are suddenly flooded with activity. This new activity, in turn,
   can command attention, via direct connection to higher-level areas.{sn}The
   [frontal eye fields](https://en.wikipedia.org/wiki/Frontal_eye_fields)<sup>W</sup> seem
   to be one brain region involved in keeping track of visual attention, and in
   making saccades when necessary.{/sn} 
   
If this understanding of perceptual grouping is correct, then Gestalt-based
letterfitting boils down to ensuring that all letter pairs strike the same
balance between two opposing requirements: the gap must be narrow enough to facilitate
grouping, and wide enough to prevent visual degradation of the letters' skeletons.


## From perceptual grouping to letterfitting 
We will now explore the delicate balance between grouping and skeleton degradation.

### Losing a letter's skeleton to interference
At the scale of the stem thickness, each letter activates a
population of G-cells corresponding to its medial axis skeleton. Primarily, it
is the letter's ink that gets skeletonized; but in some situations, 
counter-space features could be recruited as well:

<img src="img/skeleton_example.png" alt="Skeletons">

As noted, these skeletons stay relatively invariant across font styles, enabling
letter-detecting neurons to function simply via spatial integration of
particular skeleton features.{sn}Note here that a medial axis skeleton always
has "serifs" extending into corners, even in sans-serif fonts, so the perceptual
difference between serif and sans-serifs is smaller than it might appear.{/sn}
But successful skeletonization depends on the activity of B-cells; B-cells
depend on the activity of V1 complex cells; and those in turn are affected by
the presence of neighbouring letters.

{mn}<img src="img/v1_interference_example.png" alt="V1 interference
example"><br>*Left:* A simple cell activates fully, thanks to the presence of
the left letter's right stem. *Right:* Tigthening the pair places the
neighbouring letter into the cell's receptive field, reducing its
activation.{/mn} To illustrate this effect, let's consider a V1 simple cell tuned to
a light-dark-light pattern. The left letter of a pair is positioned such that
its right-hand stem coincides with the "dark" region, activating the cell. We
now move the right letter closer to the left. Eventually, its left stem will
enter the cell's receptive field in the "light" region. Even though the letters
are still a considerable distance apart, this will reduce the cell's activation.
One way to think about this is that to our visual system, whether two letters
are overlapping isn't a binary question; it rather depends on the spatial
frequency in question.

Therefore, in locations where two letters approach very closely, only the
finest-scale complex cell activations will stay intact. This reduces the
activation of B-cells and, in turn, of the G-cells that constitute the skeleton
from them:

{mn}Shown here is an extremely tightly fitted sans-serif, for effect, as serifs
naturally enforce wider gaps. The weakened activation of B- and G-cells is shown here in lighter colours on the right.{/mn}
<img src="img/skeleton_example_reduction.png" alt="skeletons">

On top of that, G-cells located in the gap now absorb some activity as well.
This creates ambiguity about the polarity of border ownership in the gap, and the
associated inhibition further dampens the G-cells that make up the stems' skeletons.

<img src="img/skeleton_example_reduction2.png" alt="skeletons">

Note that there is also a set of larger G-cells centered on the gap,
encompassing both letters, such that activity corresponding to the left letter's
outer edge will filter up to these larger G-cells and then feed back to the
right letter's outer edge.

Both of these facilitate perceptual grouping between the bars. In fact, we can
deploy our attention at different scales: by focusing narrowly on the center, we
can switch the ownership of the inner edges to the gap; but we can also choose
to "see" a single, thick bar (which happens to have a stripe down the middle).
The complexity is quite impressive, and we have not even taken into account
amplifying effects from contour integration, both along the stems and across
gaps, which in turn create illusory T-junctions, which lead to additional
suppression, etc.

To fit a pair, **we need to estimate how much activity in both letters' original
skeletons is lost when they are placed at some distance.** Different frequency
scales should be weighted differently when the losses are tallied up, such that e.g.
degraded stem skeletons are penalized more heavily than degraded serifs. In more
advanced models, pre-trained letter classification networks could be used to
determine the parts of the skeleton most relevant to distinguishing the letter
in question,{sn}This would probably rely on some salience-mapping technique like
[GradCAM](http://gradcam.cloudcv.org/).{/sn} and penalize losses to these parts
most heavily. For now, we will only concern ourselves with illiterate,
Gestalt-based models.

### Challenges of grouping
Conversely, to estimate the strength of grouping, **we need to estimate how much
activity in both letter's original skeletons is gained,** and we will do this in the next section.

Letterfitting tools operate on isolated pairs, and one noteworthy issue is that
such pairs tend to have some opportunities for perceptual grouping that don't
exist in the context of words. In particular, grouping of the outsides is
something that can easily happen in pairs, even though it rarely occurs in words due
to the influences of neighbouring letters:

<img src="img/grouping_word_context.png" alt="Grouping in the context of a word">

It is in our interest to ignore grouping effects that only occur in pairs,
because their strength will depend on the letters' widths and therefore affect letters differently.

Human designers sidestep this effect altogether by following simple rules: for
instance, all straight-stemmed pairs like *ii*, *nl*, *mp* etc. are typically
fitted to exactly the same distance. Ideally, our algorithmic solution won't
need to fall back on such crude rules. In most cases, the effect is negligible,
but we should nevertheless be aware of it (and prepared to consider solutions to minimize it).

<!--
### Balancing skeleton losses and grouping gains

<img src="img/benchmark_gaps.png" alt="Some benchmark letter pairs: nn, oo, nl,
and IUL">

<p class="missing">
Explain the asymptotic length-invariance of parallel stems
</p>

<p class="missing">
Explain round-round interactions via weaker contour integration and less
disruption of V4
</p>

<p class="missing">
Explain IUL via balance between weaker horizontal contour integration and
stronger inhibition from false inter-stem medial axis (b/c smaller radius).
</p>

<p class="missing">
Illustrate effect of serifs, italics, x-height and weight
</p> -->


