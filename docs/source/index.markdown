<article>

# YinYangFit ☯
*Modelling for automatic letterfitting, inspired by neuroscience*

<img src="img/abstract.png" alt="Abstract"/>

<h2 class="nonumber">Acknowledgements</h2>
This research would not have been possible without funding from Google,
for which I have Dave Crossland to thank in particular. I am grateful
also to Simon Cozens and others for many valuable discussions.

<!--## Contents
1. [Abstract](#abstract)
2. [A good fit: what does that mean?](#intro)
4. [What can vision research teach us about letterfitting?](#vision_research_letterfitting)
5. [Models of the visual cortex](#modelling_visual_cortex)
6. [Building a multi-scale letter pair analyzer](#multiscale)
7. [Extending our model: lateral inhibition and divisive normalization](#extending)
8. Results (check back soon!)
9. Parameter tuning (check back soon!)
10. YinYangFit, the tool (check back soon!)
3. Appendix: [Exisiting letterfitting tools](#existing_tools) -->

<h2 class="nonumber">Abstract</h2>
Adjusting letter distances to be visually pleasing is a challenging and
time-consuming task. As existing tools are too primitive to reliably handle the
infinite variety of typefaces, designers have to mostly rely on their intuitive
judgment.
I review how letterfitting fits into the current scientific understanding of how
letters and words are perceived in the brain, and present approximate models
that can be fitted to to existing, hand-fitted fonts using backpropagation.

<h2 class="nonumber">Epistemic status: tentative</h2> 
This article is based on a survey of hundreds of peer-reviewed articles,
and in line with mainstream ideas in vision and neuroscience research. It is the
product of nearly a year of work and countless revisions. That said, even the
in-vivo evidence for the suggested models is often indirect or circumstantial.
Nothing in this article should be construed as final. I welcome corrections!  

## Introduction: form follows function, beauty follows legibility

Letterfitting refers to the process of adjusting the distances between
pairs of letters{sn}I use the word "letter" very liberally; the more
general term is [glyph](https://en.wikipedia.org/wiki/Glyph).{/sn} during
typeface design. {mn}<img src="img/spacingkerning.png" alt="Spacing and
kerning"><br> Red vertical bars show side bearings, blue vertical bar shows
a negative kern.{/mn} It's often referred to as "spacing and kerning",
because pair distances are the sum of fixed amounts of space around
every letter (so-called *side bearings*) and additional adjustment
values for individual pairs (so-called *kerns*). Quality fonts often
contain thousands of hand-kerned pairs that undergo weeks of testing and
refinement.

Some would say that a good fit is simply the result of the designer's
personal intuition for beauty.{sn}Type designers who adjust pair
distances by hand often feel that there seems to be no right
answer. In those moments, letterfitting can feel quite arbitrary.
If you have not experienced this yourself, the venerable [kern
game](https://type.method.ac/) lets you try your hand on existing
fonts.{/sn} Others have invoked the aesthetics of an "even colour",
i.e. a printed page with a uniform texture and no noticeable blobs of
black or white. Meanwhile, Frank Blokland has argued{sn}See his [PhD
thesis](https://www.lettermodel.org/).{/sn} that the distances between
letter stems are mainly a holdover from the early days of printing,
when the measurements of cast type were the result of practical
considerations.

These ideas aren't wrong, but they're underpowered. None have led to
automated letterfitting algorithms{sn}I've listed the most
popular existing attempts in the [appendix](#existing_tools).{/sn}
that reliably reproduce the hand-tweaked pair distances in existing
fonts—from hairline slab serifs to broad-nib italics, from captions to headline
sizes, and from Latin to Khmer.

So let's start from square one: with a solid model of how reading works
in the brain. By reframing letterfitting as the pursuit of *optimal
legibility* (and not of beauty), we can climb on the giant shoulders of
generations of vision researchers and begin to understand what vague
ideas like "black-white balance" actually mean in our visual cortex.
Our working hypothesis: well-fitted text is text that most effectively activates the
neural circuitry that allows us to read letters and words, and therefore
maximizes reading speed.

The connection between type design and legibility is self-evident
and well-studied.{sn}Type legend Charles Bigelow recently
compiled a [comprehensive review of empirical legibility
studies](https://www.sciencedirect.com/science/article/pii/S004269891930
1087), covering many important concepts including weight and optical
sizing.{/sn} But even though psychologists have published empirical
findings galore, we are only just beginning to understand the neural
architectures which explain them, and which will one day power the type
design tools of the future. For vision researchers looking for ways
to test neural models of shape and Gestalt perception, the thousands
of high-quality, hand-fitted fonts in existence today present a rich
testing ground—and a completely underappreciated one. I hope that this
article will inspire both typographers and vision researchers to more
deeply explore the connection between letterfitting and perception.


## Letterfitting as perceptual grouping

Letterfitting means making a compromise between the legibility of letters and
the integrity of words. Intuitively, moving letters further apart makes it easier to
recognize them:

<img src="img/distance_letter_identification.png" alt="Letter identifiability is low for extremely tight pairs and high for very loose pairs.">

Letter identifiability is important. But to form a *word*, letters need to stay
close enough to allow our visual system to perceive them as a group.

Perceptual grouping is a complicated process. The neurons that group
visual signals into coherent objects operate at different scales, and
they compete with one another. When one pair of letters is tighter than
the next, perceptual grouping will bind the first pair tightly together, at the
expense of the second. Consider the following example:

<img src="img/grouping_relativity.png" alt="Illustration of the importance of consistency of fit vs absolute distances.">

In the first column, the well-fitted word is perceptually grouped into a single
object. In the middle column, the loosely fitted word is still perceived as an
object, but it has to compete with the perception of its constituent letters.
Finally, the poorly fitted word in the last column triggers the perception of
*two* separate objects, namely the single letter *c* and a pair *at*.

The primary objective of a good fit is to avoid the latter situation.
When some pairs group more strongly than others, words are fragmented
into separate perceptual objects, which makes reading difficult. The
secondary objective of a good fit is to make the fit as tight as
possible without hampering the identifiability of each letter.

Perceptual grouping networks are a fundamental piece of our vision
circuitry, and not exclusive to reading. Still, knowledge about letter shapes
can affect fitting decisions. We will therefore review the latest scientific
models of both vision *and* reading.

Our brain's visual processing system is divided into multiple regions, each of
which represents the incoming visual imagery at a different level of
abstraction. Anything we see—landscapes, patterns, text—activates neurons in
each one of these brain areas. While neurons in the lower-level areas respond to
concrete details in the visual input, neurons in higher-level areas respond to
the presence of particular configurations of such details. This allows us to
simultaneously experience the raw visual qualia *and* comprehend what we see on
a more abstract level. 

Whether we are looking at an apple (and recognizing it as such), a tree
(and recognizing it as such), or a word (and reading it), the same
visual circuitry is at work—with the exception that the highest-level neurons responsible for
recognizing apples and trees are located in a different brain area than those
dedicated to recognizing letters and words.

<img src="img/vision_model.png" alt="Vision model">

Many readers may have had some exposure, however superficial, to the
concept of deep convolutional networks. It is tempting to conceptualize
the architecture of the visual cortex as such a network: raw visual
input enters at the bottom, undergoes processing through multiple
layers, then comes out the top as a neat classification of a word. But
perception, and perceptual grouping in particular, is a dynamic process. It is
not a computation with input and output, but a dance of electrical activity
that evolves through time.{sn}[This interactive
visualization](http://nxxcxx.github.io/Neural-Network/) is far from realistic
but a much more useful visual metaphor than feed-forward deep learning
architectures.{/sn}

With that in mind, let's go on a brief tour through our visual system.

## From the retina to the primary visual cortex

Sensory input from the eye travels up the optic nerve, through
the lateral geniculate nucleus (LGN) on the brain's thalamus,
to the visual cortex at the very back of the head.{sn}For our
computational purposes, we will ignore any image processing
performed by the retina and thalamus, such as the luminance
adaptation and pooling operations performed by [retinal ganglion
cells](https://en.wikipedia.org/wiki/Retinal_ganglion_cell).{/sn}

{mn}The wonderful illustration is adapted from Nicolas Henri Jacob (1781–1871), *Traité complet de l'anatomie de l'homme comprenant la medecine operatoire, par le docteur Bourgery*. Available in the [Anatomia Collection](https://anatomia.library.utoronto.ca/) of the Thomas Fisher Rare Book Library, University of Toronto.{/mn}
<img src="img/vc_anatomy.png" alt="Anatomy; location of the visual cortex">

The first phalanx of cells—the primary visual cortex,
or V1—performs what amounts to a band-filtered wavelet
decomposition. Each neuron here is retinotopically{sn}That is,
neurons are laid out to [roughly mirror the organization of the
retina](https://en.wikipedia.org/wiki/Retinotopy), such that adjacent
photoreceptors are connected to nearby neurons in the cortex.{/sn}
connected directly to a small contiguous group of photoreceptors,
its *receptive field* (RF),{sn}To be clear, the majority of neurons
physically located in V1 don't actually receive direct input from the
eye but rather just serve as local connections to facilitate basic image
enhancement, such as contrast normalization, but we will skip here the
organization of V1's layers.{/sn} and activates whenever a particular
subset of the receptors detects light but the others don't. The on/off
subsets are laid out such that each neuron effectively detects a
small piece of a line or edge of a particular size and orientation
somewhere in the field of vision. {sn}For those readers completely
unfamiliar with these concepts, I recommend watching [this introductory
animation](https://www.youtube.com/watch?v=NnVLXr0qFT8), followed by
[this Allen Institute talk](https://www.youtube.com/watch?v=mtPgW1ebxmE)
about the visual system, followed by [this in-depth MIT
lecture](https://www.youtube.com/watch?v=T9HYPlE8xzc) on the anatomical
details.{/sn}

<img src="img/edge_line_rfs.png" />

These neurons are called *simple cells*, and we can easily predict
their response to a given input. For instance, when we see an
single uppercase *I* on a page, some simple cells will respond
strongly and others not at all, depending on the tuning and location
of their receptive fields.{sn}David Hubel and Torsten Wiesel
first discovered this in the 1950s by showing patterns of light
to a cat after sticking electrodes into its brain (Youtube has a [video of said
cat](https://www.youtube.com/watch?v=Yoo4GWiAx94)). The researchers went
on to win a Nobel Prize for their experiments.{/sn}

In software models, the filtering operation performed by
simple cells is typically implemented as Fourier-domain
multiplication with a bank of complex band-pass filters $G(s, o)$ (where $s$ is
the frequency scale and $o$ the orientation).{sn}[Gabor
patches](https://en.wikipedia.org/wiki/Gabor_filter) are most
commonly used, but many alternative models with better mathematical properties are
available.{/sn} This set of convolutions turns the two-dimensional input image into a
four-dimensional tensor of complex numbers (widtht × height × spatial
frequency scales × orientations), the magnitude and phase angle of
which capture the activation of simple cells $S_\mathrm{V1}$ at every
location.

$$
S_\mathrm{V1}(x, y, s, o) = \mathcal{F}^{-1}(\mathcal{F}(I(x, y)) \mathcal{F}(G(s, o)))
$$

{mn}<img src="img/complex_value.png">{/mn}

For instance, to retrieve the activation of representative simple cells at phases 0°, 90°, 180° and 270°, we
could half-wave-rectify as follows:

$$
\begin{aligned}
S_{\mathrm{V1, 0\degree}}(x, y, s, o) &= |\mathrm{Re}(S_1(x, y, s, o)| \\
S_{\mathrm{V1, 90\degree}}(x, y, s, o) &= |\mathrm{Im}(S_1(x, y, s, o)| \\
S_{\mathrm{V1, 180\degree}}(x, y, s, o) &= |-\mathrm{Re}(S_1(x, y, s, o)| \\
S_{\mathrm{V1, 270\degree}}(x, y, s, o) &= |-\mathrm{Im}(S_1(x, y, s, o)| \\
\end{aligned}
$$

This operation yields responses like these:

<img src="img/single_i_example.png" />

As it turns out, some V1 neurons are less sensitive to phase than
others, and some may even respond equally to both lines and edges,
as long as scale and orientation match their tuning. Those cells are
called *complex cells*.{sn}Simple and complex cells lie along a spectrum
of phase specificity, which is brilliantly explained by [this recent
paper](https://www.biorxiv.org/content/biorxiv/early/2019/09/25/782151.f
ull.pdf) by Korean researchers Gwangsu Kim, Jaeson Jang and
Se-Bum Paik. But it seems that there's even more to the
story, as complex cells seem to [change their simpleness
index](https://hal.archives-ouvertes.fr/hal-00660536/document)
in response to their input as well.{/sn} Thanks to their phase
invariance, complex cells can extract key structural information at
the expense of colour and contrast data. But contrast and colour are
irrelevant to reading—we can read black-on-white just as well as
white-on-black—suggesting that it is mainly complex cells that provide the
relevant signals to higher-level brain areas.{sn}In practice, it is measurably
easier to read dark text on light backgrounds. Not only do light
backgrounds make the pupil contract, [creating a sharper
image](http://dx.doi.org/10.1016/j.apergo.2016.11.001), but V1 outputs are also
[stronger for darker colours](https:///doi.org/10.1523/JNEUROSCI.1991-09.2009),
which may contribute in higher-level shape-recognition stages.{/sn}

To be clear, this does not mean that the signals from simple cells are lost or
discarded. Just like the signals from colour-detecting cells in the
so-called *blob* regions of V1, which are not further discussed here, their
outputs do contribute both to our experience of vision and to the activity of
higher-level brain regions. For reading (and thus letterfitting) purposes,
however, we will focus on the responses of complex cells.

Traditionally, complex cells were thought to sum the outputs of nearby simple
cells of equal scale and orientation. This is now known to be a gross
oversimplification. In software, a similar approach is nevertheless taken to
approximate the output of complex cells $C_{\mathrm{V1}}$, namely a simple computation of the
absolute magnitude of the complex tensor:

$$
C_\mathrm{V1}(x, y, s, o) = |S_\mathrm{V1}(x, y, s, o)|^2
$$

This is often called the *local energy*. The squaring operation shown here is
often used to approximate the nonlinear behaviour of complex cells in
particular.

Applying this phase-squashing to the above images yields:

<img src="img/single_i_complex_example.png" />

Of course, the squaring operation used here is a simplification.

[Explain divisive normalization]

## Area V2, Portilla-Simoncelli texture correlations, and crowding effects

Area V1 deconstructed the incoming imagery into thousands of edge and line
fragments. Area V2 helps find patterns in those signals, patterns that form the
basis for the perceptual grouping effect we are interested in.

Each neuron in V2 takes its input from a combinations of neurons in
V1.{sn}Again, we will skip here a discussion of the various layers and
interneurons of V2.{/sn} The choices of V1 inputs are (nearly) endless, and indeed, V2
contains a vast variety of neurons representing all kinds of different
correlations between V1 neurons: correlations between simple cells and complex cells, between
cells of different scales and orientations, and between cells at different spatial
locations.

[image]

Intuitively, many of these correlations may appear to be meaningless.
As it turns out, however, the local ensemble of many of such correlations
effectively describes the texture of the scene. In a now
famous experiment, researchers systematically computed a few dozen
of such correlations for a given scene. They then synthesized new
images, by tweaking random pixels until local averages of their V2 correlations
matched the ones in the original scene:{sn}The first iteration of this
[idea](https://doi.org/10.1023/A:1026553619983) came about in 1999 and is due to
to Javier Portilla and Eero Simoncelli. Two decades later, these
"Portilla-Simoncelli textures" have inspired countless psychological
studies and attempts to refine the model.{/sn}

{mn}The "image metamer" on the left was
[generated](https://dx.doi.org/10.1038%2Fnn.2889) by Jeremy Freeman
and Eero Simoncelli in 2011 based on the same principle of matching
image statistics. As in the human brain, the authors averaged the statistics over a wider area in the
periphery than in the fovea. When focusing strictly on the image center, the
metamer is difficult to distinguish from the original.{/mn} <img
src="img/metamers.png" alt="From 'Metamers of the ventral stream'">

As evident here, a mere approximation of these
averaged image statistics measured by V2 is enough to simulate,
with eerie fidelity, how we perceive our visual periphery. This is no coincidence:
after all, higher-level areas (here, V4) precisely respond to
particular configurations of such V2 neurons, so synthesizing images
which evoke similar V2 activations will also result in similar
higher-level perceptions, even if the actual input signals are quite
different.{sn}One could think of this as the inverse of an [adversarial
input](https://en.wikipedia.org/wiki/Adversarial_machine_learning).{/sn}

That V2 neurons so effectively describe local image statistics presents
us with a first opportunity to reify a heretofore vague concept into
something concrete and computable: namely, that "rhythm" or
"balance" between black and white translates to correlations between V1
responses. And indeed, this appears to be possible:

{mn}Javier Portilla and Eero Simoncelli demonstrated how a set of V2 statistics
computed and averaged over an image of text could be used to extrapolate
the perceived texture outwards. The comparably poor quality of
this example taken from their paper should not be taken as reason
to dismiss the idea; it was generated at low resolution over two
decades ago and averaged the statistics too aggressively. Many more
sophisticated variants of the model have since been published, with promising
results especially on natural scenes.{/mn} <img
src="img/text_v2_texture.png" alt="Texture extension on image of text.
From Portilla and Simoncelli, 2000.">

We may be tempted to exploit this effect to build a simple letterfitting
strategy in which we iteratively adjust pair distances in an image of
text until a chosen set of V2 responses is nice and uniform across
the entire image. And indeed, I believe this would be the most
effective and biologically faithful approach to achieve a perfectly even
typographic "colour". However, it would likely create *too* even of a colour, at
the expense of the readability of letters and words. There simply is no getting around understanding the
grouping mechanisms that rule our perception of shapes.

Still, V2 statistics matter. Not only might they serve as a useful tool
to optimize visual consistency during the type design process itself—a
topic for another research project!—but they are intimately related to
perceptual grouping through a phenomenon called *crowding*.


## Contour integration, V1 feedback, and border ownership

Next, consider what happens to the activations of simple and complex cells when
a second letter is added. Shown here, for instance, are the activations of some
complex cells to the left and right side of a lowercase *n*. (The
fixed-phase receptive fields are shown only to illustrate the peak-response
phase angle at the given location).

<img src="img/abstract.png">

The V1 response to the standalone letter includes cells whose
receptive fields cover, in part, the space to the right of the letter.
Adding a neighbouring letter on the right partly fills this space, reducing the
activation of said cells. In other words: adding the neighbour directly takes
away from the signal available to stimulate higher cortical areas, i.e. the letter detectors.

This interaction goes both ways: it happens simultaneously for both involved
letters, and it is a direct result of the squashing of phases into local
magnitude values that is characteristic of complex cells. In particular, the activation near
the inner edges of the letter pair is reduced, and thanks to the squaring operation, the activation within the gap
is strengthened.{sn}Note also that this is distinct from the
[lateral masking effect](https://en.wikipedia.org/wiki/Lateral_masking) commonly
attributed to lateral inhibitive connections in the early visual cortex.
Somewhat surprisingly, the
only author known to me who has [published
on](https://doi.org/10.1016/j.bbr.2018.04.016) interference at the stimulus
level is researcher Bernt Christian Skottun, who has (as of early 2020) not
garnered any citations on his papers.{/sn}

The neurons there perform what
amounts to a band-filtered wavelet decomposition. Next, the individual
signals representing the presence of oriented fragments of lines
or edges are correlated by neurons in V2 across space, scale, and
orientation. These signals, in turn, are further correlated in area V4,
allowing neurons there to respond to the presence of particular shapes
or textures. Finally, a hierarchy of cells in the so-called visual word form area,
located on the underside of the left hemisphere of the brain, detects letters,
combinations of letters, and words. 

Superficially, this resembles the kind of feed-forward convolutional networks popular
in image recognition software, in which perception is the result of a
computation. In the brain, however, plenty of recurrent neural connections turn
perception into a continuous process. In particular, conscious perception
emerges from the give-and-take between lower-level brain areas,
whose state represents fresh sensory input, and higher-level areas, whose state
represents the current, pre-processed, sanitized understanding of the world.{sn}This is a slapdash
framing of [set](https://en.wikipedia.org/wiki/Set_(psychology)) as [Bayesian
inference](https://en.wikipedia.org/wiki/Bayesian_inference_in_motor_learning)
via top-down modulation: the original state of the higher-level area corresponds
to a statistical prior, the updated state to a posterior, and the concept of
states itself to [attractors](https://en.wikipedia.org/wiki/Attractor). This is a deep and
fascinating area of research of itself, and this article is only meant to convey
an intuition, not a rigorous description of reality.{/sn}

It is accepted, for instance, that lateral connections in V1 allow
neurons to inhibit others that are tuned to similar locations,
orientations or scales in proportion to their own activation, such that
after a few dozen milliseconds, only the neurons with the strongest
activations stay active. This achieves a kind of sharpening of the
signal, and it is likely that the same competitive mechnanism is active
throughout the brain.

Similarly, feedback from higher brain areas can amplify or inhibit the
activity of lower-level areas. For example, if V1 responses suggest the
presence of a pattern of uniform scale and orientation over a large area
(e.g. a vertical grating), the V2 neurons picking up this correlation
across space will actively suppress the V1 neurons providing the input. After
a brief time, this will dampen the perception of the pattern, while leaving
untouched the perception of the pattern's edge (where V2 activation was weaker).

## Tight and loose fits in convolutional reading models

Our reading circuitry itself is best understood as a series of feedback loops
as well: between detectors of letters, letter-combinations, and words, such
feedback dynamics are necessary to resolve uncertainty about what is seen on the
page. Consider the following paradox, which vision researchers
have probed in endless studies: on one hand, we can raed wrods even
when their letrtes are out of odrer, indicating that the brain
ignores most information about letter positions.{sn}[Jumbled
letters](https://en.wikipedia.org/wiki/Transposed_letter_effect)
are a crowd favourite ever since the infamous [Cambridge
email](http://www.mrc-cbu.cam.ac.uk/people/dennis.norris/personal/cambri
dgeemail/) meme. The strength of the effect appears to
depend on many factors: the [relative position of the
letter](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2662926/),
[the jumbling
distance](http://www.bcbl.eu/consolider/images/stories/publications/Pere
a_etal_ExpPsy07.pdf), and on [your
age](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6542500/)
(curiously, it does not depend on whether you are a human [or a
baboon](https://journals.sagepub.com/doi/abs/10.1177/0956797612474322)).
English words are particularly forgiving to letter transpositions,
while e.g. Semitic languages are much more sensitive to them, as 
[pointed out](https://dx.doi.org/10.1017%2FS0140525X11001841) by Israeli
researcher Ram Frost.{/sn} On the other hand, we have no trouble
distinguishing anagrams like *cat* and *act*. Nobody has yet observed
the responsible neurons in action, but the mountains of experimental
data tell a story that goes like this:

The word *cat* appears in the center of vision, triggering a cascade of
electrical pulses in the visual cortex. Vertical, horizontal, and angled
features are detected in various places, and they combine to activate neurons
that code for the presence of letters. In early models of reading, researchers
thought of these letter detectors as assigned to fixed positions,
representing data like *"c" in position 1*, *"a" in position 2*, and so forth—but
that's not realistic. Instead, there are probably multiple detectors activating for
each letter, and because of the spatial uncertainty introduced by multiple
levels of convolutional feature detection, all they can do is collectively express a
probability distributions in space:{sn}This is the [overlap
model](https://doi.org/10.1037/a0012667) by Gomez, Ratcliff, and Perea.{/sn}

<img src="img/ld_lcd.png" alt="Letter detector and letter combination detector neurons">

The probabilistic nature of this architecture, which is illustrated
in the diagram by circles representing stronger and weaker
activations, naturally extends to neurons which detect the
presence of ordered combinations of letters.{sn}The
concept of such combination-detecting neurons originated with the
[open bigram model](https://doi.org/10.1080/01690960344000198)
championed by researchers Carol Whitney and Jonathan Graigner.
Soon, biologically plausible models were proposed (I particularly
like [this paper](https://doi.org/10.1016/j.tics.2005.05.004)
by Dehaene et al. for its lucid explanations), followed by
[fMRI evidence](https://doi.org/10.1016/j.neuron.2007.05.031).
{/sn} Although the diagram above shows only two types of
detectors—letters and bigrams—the brain likely contains
a whole interconnected hierarchy of them, detecting letters,
bigrams, trigrams, quadrigrams, and larger morphemes, all of which
contribute to the detection of the word.{sn}There
is increasing evidence that our brains develop direct, visual,
orthographic representations of words we encouter often, without
having to recruit e.g. phonologic processing (see e.g. [this
study](https://doi.org/10.1523/JNEUROSCI.4031-14.2015) by Glezer et
al.). It is not clear whether detectors correspond to single neurons
(sparse coding) or constellations of neurons (population coding),
especially at the level of quadrigram or morpheme detectors.{/sn} All
of the above likely use overlapping, Gaussian-weighted receptive fields.

Which word we finally perceive is not up to the letter-combination detectors,
however. Instead, that's a decision for the rather more dignified brain areas
that deal with language processing—and they are free to disagree with the visual
system. To illustrate, let's consider a situation where *cat* was, in fact, a
typo for *act*.

Imagine, for instance, that just before seeing "cat" we had read the
words "police caught the bank robber in the". At this instant, our
language networks are already sizzling with electrical activity that
renders the neurons for *act* especially sensitive. Shortly after, some
signals arrive from below:{sn}Or from behind, rather,
to remain faithful to anatomy.{/sn} signals for CA and AT, moderate
signals for AC and OA, and some weak signals for CT, as shown in
the diagram above. However, despite their strong activation, the
neurons for CA and AT find it difficult to activate any word-coding
neurons. Sure, *cat* fires some spikes, but without the support of
the rest of the language network, it's a rather hesitant activation.
Meanwhile, even the comparatively small contributions of AC and CT
(and AT, which is also weakly connected to *act*) are enough to
give the primed *act* a serious boost. This seals the deal, because
*act* has modulatory neural connections going backwards to AC and
CT, creating a self-amplifying feedback loop that has *act* glowing
red-hot (metaphorically) within just tens of milliseconds, far
outdoing any notion of *cat*.{sn}This story is a tremendous
oversimplification. The neural deliberations involved in word
individuation depend on first and last letters, syllable structure,
position of vowels and consonants, and other factors that are still the
subject of painstaking research.{/sn} In addition, detectors
may well have lateral inhibitive connections to implement direct
competition between them, so as time passes, *act* may actively
suppress *cat*, or the two may oscillate back and forth, depending on
the circumstances. No diagram can do these complicated two-way dynamics
justice, of course, but we might visualize the effect of the initial
top-down feedback like so:

<img src="img/ld_lcd_feedback.png" alt="Letter detector and letter combination detector neurons, with feedback">

This process of "word individuation" takes about quarter of a second;
meanwhile, the eyes have long moved on to the next sentence.{sn}There are several EEG studies on this subject, but
[this one](https://www.pnas.org/content/113/29/8162) is especially cool
as it involves deep-brain stimulation of live human volunteers.{/sn}
A quick reader might therefore never notice the typo at all. Of
course, this error-correcting mechanism is even more effective for
jmbueld letrtes, because *letrtes* isn't a word at all—there are
no neurons or synapses coding for it in our language system, so
the next-best word will always win by default. That's true even
though the initial mismatch may be enough to draw your conscious
attention, which unpleasantly interrupts the flow of reading.{sn}It's not clear how that works, although the
[predictive coding](https://en.wikipedia.org/wiki/Predictive_coding)
theories of the brain, promoted heavily by researchers like Karl
Friston and Andy Clark, provide some promising ideas. [This
article](https://dx.doi.org/10.3389%2Ffpsyg.2012.00096) by Jacob Hohwy
contains many of the relevant references.{/sn}

This understanding puts in stark relief why letters should not be too close *or*
too far apart. Strong
activations in the correct letter detectors and letter-combination detectors,
and the absence of activation in distracting signals, guarantee that activity
settles on the right word detector *quickly*.{sn}Notably, the model
also predicts that jumbled letters are easier to read in a tight fit—I'm
not aware of any studies on this, but it certainly seems plausible. However, the
tight fit would lead to more letter identification and letter position errors ispo facto, so it's still more
desirable to optimize under the assumption of correctly spelled text.{/sn} And the faster and more
confidently readers perceive words, the faster they can read without needing to
do jump back for double-takes.

<img src="img/no_th.png" alt="Effect of pair distances on letter detectors and LCD">

I grant that the above story remains a hypothesis until electrocorticographical evidence
shows an effect of letterfit on the temporal dynamics of word individuation. The
theory seems plausible, however, and compels us to find ways to estimate how pair
distances affect letter detectors and letter-combination detectors.

The architecture described above suggests that the most effective way
to activate a particular letter detector is to present nothing but the
corresponding letter—in other words, at a pair distance of infinity,
or at least exceeding the width of our field of vision. Contrarily, it is
intuitively clear that touching or even overlapping letters are difficult to recognize.
This would mean that more loosely fitted words are easier to
recognize, and indeed, research confirms just that.{sn}See e.g.
[these experiments](https://doi.org/10.1371/journal.pone.0047568) by
Gomez and Perea. Buy sadly there's no free lunch for typographers,
either. When text is tracked out, less of it fits into the field of
sharp vision (the "visual span", as Gordon Legge calls it), so it
takes extra saccades to process the whole text (see e.g. Legge et
al.'s [visual span experiments](https://doi.org/10.1167/7.2.9)).
All in all, it's a wash in terms of reading speed. The only ones
who consistently benefit from a looser fit are dyslexics, as
[reported](https://doi.org/10.1073/pnas.1205566109) by Marco Zorzi et
al., which suggests that (at least some forms of) dyslexia are related
to a deficit in letter-position coding.{/sn} We will discuss the mechanisms
responsible for this letter-letter interaction in the next section.

At excessively large distances, the letter detectors are too far apart in space
in order to jointly activate the letter-combination detectors, which after all
have receptive fields of a limited size.{sn}In fact, [this
experiment](https://doi.org/10.1167/11.6.8) by Fabien Vinckier et al. showed
precisely that once more than two spaces are inserted between letters, reading
speed drops off a cliff, a distance which aligns well with the proposed receptive field
size of bigram detectors.{/sn} This could explain why excessively loose fits hurt legibility.

We can further note that in tight pairs, the problem of diminished letter
detector activation is actually compounded by an increase in the activation of
the reverse-order bigram detector, which likely directly competes with the
desired bigram detector (shown as the comparatively strong activation of AC in
the top row of the diagram above). But in practice, the severity of this problem likely
pales in comparison to the weakening of the letters themselves, and its
effect on word individuation speed depends on too many other factors (width
and shape of the letters, orthographic frequency of the reverse-order pair,
etc.) to model it effectively. 

## Word perception in reading models

As we have seen, current models of reading offer some ideas for why letters
must not be too close or too far apart, and even how we might go about
estimating the impact of pair distance on letter detector activation.
Unfortunately, they do not address word perception, which motivates regularity
of fit. What do we know about word perception?

To scan a line of words, our eyes make saccadic movements. After coming to rest for a fraction
of a second to take in some imagery, the eyes make a targeted jump ahead just far enough to reveal text
that was previously too blurry to process.{sn}Researchers have
studied saccades in reading for a while: Gordon Legge et al. built a statistical model called
[Mr. Chips](https://doi.org/10.1037/0033-295X.104.3.524) in 1997 to predict the
need for saccades based on partially perceived words, and [found it to match
human performance quite
well](https://doi.org/10.1016/S0042-6989(02)00131-1).{/sn} There is
significant overlap between the images from subsequent saccades, and although
the eyes often come to rest between the beginning and middle of each word, fast
readers can easily take in multiple small words in a single saccade. The visual
cortex therefore needs a mechanism to keep track of words across saccades, and
our reading circuitry needs to be able to limit processing to individual words.

This challenge, of course, is not particular to reading text. Our
gaze and our head move around constantly, and yet we effortlessly
lock onto a single tree in a forest of others. Evidently,
our visual system automatically groups raw sensory signals into
coherent objects according to certain rules,{sn}This ability is intricately linked
with depth perception, which primarily relies on [binocular disparity](https://en.wikipedia.org/wiki/Stereopsis).
Without it, we would not be able to examine and learn about objects.{/sn} and
the same mechanisms help us keep track of individual words.

The letter detectors in our visual word form
area are evidently able to limit themselves to single words at a time,
even though many other letters are clearly being processed in the
visual cortex at the same time. Although the timing of activating the
letter detectors certainly plays an important role during fast reading,
word perception still works when we fix our gaze. The likely mechanism
therefore involves yet another feedback loop: paying attention to a
word, even if we are not looking directly at it, neurally translates
to injecting extra energy, top-down, into a resonating pattern of
electrical activity that extends through lower and higher brain regions
and that automatically spreads out horizontally to cover the spatial
extent of the whole word (or tree, or other object). Thanks to this
self-reinforcing feedback, a tiny bit of attention somewhere within the
word is enough to light up the entire word within a few milliseconds,
and thereby allow our reading circuitry to perceive just one word at a time.

[image]

The crucial ingredient therefore is the question: how does the attention spread
to cover the whole word?

This understanding creates a few questions. First: how does this work with
languages which don't use spaces? {sn}Historically, non-space [word
  dividers](https://en.wikipedia.org/wiki/Word_divider) symbols were common.
  Today, [Thai](https://en.wikipedia.org/wiki/Thai_script) and
  [Burmese](https://en.wikipedia.org/wiki/Burmese_alphabet) still use no word
  dividers, [Vietnamese](https://en.wikipedia.org/wiki/Vietnamese_morphology)
  divides syllables instead of words, and Koreans frequently omit spaces in
  [Hangul](https://en.wikipedia.org/wiki/Hangul) in informal writing. Then
  again, those are [isolating
  languages](https://en.wikipedia.org/wiki/Isolating_language) in which
  virtually every syllable maps directly onto a [free
  morpheme](https://en.wikipedia.org/wiki/Bound_and_free_morphemes), so spaces
  would not be of much help anyway. In more [fusional
  languages](https://en.wikipedia.org/wiki/Fusional_language) like English,
  there is no doubt that spaces help us process which morphemes belong together.
  Of course, removingspacesslowsusdown, but what's more telling is that add ing
  spa ces at syl labic breaks is less confusing than a ddi ng t hem ra ndo ml y.
  On a related note, there is some fascinating research on how our brains [break
  down
  words](https://www.researchgate.net/profile/Elisabeth_Beyersmann/publication/316312318_Edge-Aligned_Embedded_Word_Activation_Initiates_Morpho-orthographic_Segmentation/links/5addab7ca6fdcc29358b9656/Edge-Aligned-Embedded-Word-Activation-Initiates-Morpho-orthographic-Segmentation.pdf)
  into morpho-orthographic chunks during processing.{/sn}

* Perceptual grouping and crowding

* Gestalt rules

* Crowding via V2 higher-order statistics (Portilla and Simoncelli)

* Grouping via surround suppression

* Grouping via boundary selection (LAMINART model; Francis et al.)

* Grouping as an extension of the B/G cell model (von der Heydt et al.)

* Role of serifs (end cuts/contour integration vs. Kanizsa illusory contours)

## Notes

Image statistics underlying Macaque V4 textures: https://www.pnas.org/content/pnas/112/4/E351.full.pdf and update: https://academic.oup.com/cercor/article/27/10/4867/3056451

Lines are correlations between aligned energy scales.?

V4 has some high-res neurons: https://www.sciencedirect.com/science/article/pii/S0896627318301867

V4 is involved in contour integration: https://www.cell.com/neuron/pdf/S0896-6273(14)00253-0.pdf

von der heydt: https://www.frontiersin.org/articles/10.3389/fpsyg.2015.01695/full#B4

V1 -> V2 (statistics) -> V4 (shapes and statistics)
portilla: https://www.cns.nyu.edu/pub/lcv/portilla99-reprint.pdf

Then, complex interplay between texture, shape, and inhibition, which creates
grouping and crowding.

Wherever attention spreads to is a group; spreading attention within the group
can lead to texture neurons winning over shape neurons, which is perceived as
crowding.

Attention can be moved overtly (by moving the eyes) and covertly (by not moving
but just actively processing what's in the periphery to one side). 

On a high level, competition between blobs of different scales allows us to put
attention onto one scale (and not have it bleed into larger/smaller scales or
nearby objects). Attention immediately blocks other types of blobs/textures.

We have blob/texture signals in V4. Attention is always given to a
blobject/line/etc. Then that strengthens inputs in V2, which also strengthens
texture signals in V4, which can dampen the inputs in V2 slightly, which 

Perception is coarse to fine; large-scale features are perceived first. This is
in line with Gestalt dictum that whole is perceived first.

So: V4 has shape and texture recognition, both fine and coarse; coarse normally
arrives first. Even fine info is passed all the way up to frontal cortex; so
consciously appreciating a shape for what it is is different from making it
maximally readable.

Attention tends to shift tuning to smaller scales.

Theory: first, large-scale signals arrive in V4, indicating the presence of
large-scale blobs; then, smaller-scale signals arrive from below.
Timing says that V4 small-scale signals are likely more-or-less directly from
below. V4 also gets feedback from above. 

Roelfsma calls early visual cortex a blackboard. https://pure.knaw.nl/ws/files/2702020/Roelfsema2016AnnRevVisSci.pdf

1. First, coarser-resolution orientation info is passed up through V4.
2. Then, surround suppression inhibits the responses of uniform textures/gratings,
allowing boundaries to stand out.
3. Then, in V2, lack of surround suppression of the center blob from V4 allows the center blob to feed back and strengthen its V1 inputs. This is pop-out.
4. Enhanced V1 activity predicts eye movements.

Grouping is when enhanced neuronal activity spreads through a population, either
starting from pop-out, or form attention.

1. How are different colour and orientation and depth elements grouped together?
   They must be able to spread attention more easily between them. Or: via
   texture correlations.
2. Attention resolution: larger integration area would limit segmentation?
3. Can we do the computation on gaps only?

- downward gain to all
- downward inhibition down to those in the center if all inputs are the same type
- lateral competition

We need to figure out the effect of the overall texture/frequency on the text.
Large-scale frequencies and blobs appear first.

A. Explanation.

Grouping is what happens when activity spreads outwards. There are mechanisms
that facilitate spreading and mechanisms that stop spreading.

1. Large-scale frequencies appear first, in V2 and V4.
2. Generally, feedback from the top increases the bottom.
3. But sometimes, feedback from the top decreases the bottom. If surroundings
   are similar, center is reduced. So up is correlation, down positive is even,
   down negative is Gaussian and only for some neurons.
4. Horizontal interactions also contribute.

Wherever V1 is strongest, that's where the eye tends to move next. So we want V1 activation to grow equally in both directions.

Activity spreads along lines. How does it do that?

A line is active in V1. Co-aligned V1 neurons activate V2 snake neurons,
which combine to activate V4 snake neurons. Currently, attention is in
center of field of vision. Then, attention increases V2 snake, increases
V1 snake. Increases V1 snake along sideways, which also increases other
V2, spreads sideways, spreads up, if attention moves sideways a little
in V4, can move sideways. When hot V4 contains both lines, activates
both V2 signals, but can presumably put attention onto fine signals in
V4 as well, but competition in V4 is strong and not many fine signals are
available.

So we know that collinearity spreads out attention. This allows word
collinearity to spread both at line scale (because words look like snakes, as a
whole). The perception of words as a continuous snake (white-black-white) is
therefore helpful.

Say we have a filled o vs an empty n. Then the snake is stronger where the o is.
Because of horizontal inhibition within V2, the snake activity will automatically flow
towards the heaviest part of the snake. The eye will be drawn towards the filled
o. This is not so great. In other words, even a little activity of the V1 near the filled
o (in the periphery) will strongly resonate and activate the V2 snake there,
which will laterally inhibit the original V2 snake, and encourage a saccade
there.

When there is a gap in the snake, the continuity of the snake will be disrupted.
The top-down modulation can only increase gain, but not create a signal where
there isn't one. So a snake with a gap will have a V2 snake neuron that is quite
weak, and the original snake neuron will suppress it even further. (How does
that affect V4 and surround suppression?)

Regular snake:

V1 snake
V2 snake-connection neurons
V4 longer snake-appearance neurons (but also a few sharper ones)
-> attention initially on center of vision
-> this inhibits nearby V4 snake perception, but not many other snakes around,
   so V2 central snake-appearance neuron not suppressed much. Also increases
   perception downwards to V1.
-> V1 now also activates V2 lateral snake-appearance neurons, which activate V4
   nearby neurons. Still suppressed by original, but increase in V1 encourages
   eye movement and attention shift, which would immediately and easily move
   sideways.

We learn: attention spreads easily along snakes in V4. We want attention to
spread evenly; we don't want it to be stronger on one side than on the other.

There are two mechanisms at play: one reinforces round objects, and another
reinforces continuous lines. These two mechanisms are at odds with one another.
One recognizes round objects, vertical edges (which end snakes); it suppresses
the snake V2.

Finally, there are texture-percepting neurons, which also compete. In the
periphery, there are more texture-percepting neurons, so if there is texture,
they tend to win (especially in the periphery), and when they win, they allow
activity to spread.

Texture perception measures evenness of texture. Texture neurons in V4 measure
the AND presence of a combination of V2 neurons, which measure the AND presence
of V1 neurons. When those neurons are active, they can reactivate their inputs,
but also depress them.

Let's say we have a font that has very even structure. Then it is desirable to
either make the gaps equal to the counters, which will make texture spread the
attention sideways very quickly. Texture neurons in V4 perhaps don't suppress
neighbours that are similar to them, so they let activity spread outwards. The
snake neurons and upper/lower-edge neurons still cause spread. But an end-cap
neuron will strongly suppress a continuation-of-snake-middle-or-border neuron.

How about the texture neurons? We need those to explain ascenders/descenders,
and the grouping of loosely tracked words.
Texture neurons need to be able to explain the IUL problem.

The IUL problem requires that texture neurons create a minimum gap between
straight-stem letters, no matter how thick the stems are.

How can we create a minimum gap between straight stem letters?

[] [   ]   [   ] [  ] 

We need a population of neurons in V2 which, together, represent the metameric
texture of text with minimum distances.

We then need to work with that on a pair level.

Given a line of n's, which represent the texture, which position of an adjacent
"o" most readily allows for spread of attention?

So, start with a line of n's. Now there is a set of V2 neurons that are active
that represent certain relationships between the n's. 

nnnnnnnninnnnnnn

How do we figure out the statistics that encourage positioning of the i?

The question here is with counters vs gaps. The counters are sharp
upward/downward oriented, and therefore compete with the vertical-line
explanation. The overall texture is: vertical lines have some 

There are some V4 neurons that pick up counters (with horizontal edges) and
those compete with vertical edges there for the same object.

nmnmnmnmnimnmnmmnn

Is the boundary/snake continuity enough? How much value in statistics?

IUL would potentially demand getting IUL closer when stems are thinner. But then
it's unclear why there needs to be extra space on the right of the thin line.

Is there some way to combine all statistics and patches and lines?

For attention to flow out easily across the texture, and to compete with actual
details, we need V4 neurons that represent the average of the 

V2 neurons represent statistics. Images where statistics are the same everywhere
are computed by PS. I.e. images where population of V4 neurons responds to the
exact combination of V2 statistics over a large area, and then reinforces those
same statistics everywhere, even in the areas where they are weaker.

We don't have full text images available, but it is desirable for a pair image
to activate the same V2 neurons as the overall population.

This is true both for the vertical stem gap statistics, as also for long-snake
receptors in V2.

How do B/G cells fit in? V2 has the ability to recognize edges at the right of
an object. Fuzzy annular G cells enhance whatever objects fall into them.

Instead of G cells that are annular, we could have G cells that are sections of
annuli. These sections of annuli then light up the borders of the object from
the inside.

The outside borders of an object contribute to the G-cell at the center of the
object.

This much makes sense.

But now how do continuous lines fit together and excite one another?

There are neurons in V2 that 

A representation is a handle on a whole tree of neural activity representing the
actual sensory input.

We can put attention on a spatial location, which has many objects associated
with it. The objects don't have colour, they're just handles. Activating them
allows activation of the inputs, which immediately results in amplification of
what's real.

V4 has neurons that respond to snakes of collinear lines. They are most present
in horizontal central location, which may help explain why most scripts are
written horizontally and why vertical stems are thicker in scripts with
any contrast. V4 is the highest level of contour integration, there is nothing
beyond their classical RFs. 

Feedback may gate horizontal connections: when two V1 neurons form a line, V4
makes it so they don't suppress one another. V1 shows a profound inhibition of
segments in the background pattern. Can we make do with a single forward sweep
and a single backward sweep? The feedback to V1 is nonspecific as to
orientation.

So: V4 has neurons that say 

* "round concave contour somewhat north of object" -> attention creates
  modulatory feedback that activates the actual contours.
  (there are more of those with the object in the visual center)
* "line at angle 12deg"
  (there are more of those that are horizontal and in the visual center)
* "pattern of certain type"
  (there are more of those in the periphery)

When each one of these is activated, it reactivates its inputs, and it also
suppresses its competitors.

We now have to figure out: how does this affect the ability of attention to
travel across words?

We need to understand why consistency is more important than absolute spacing.
Closer-together letters group more strongly, and may compete with outside.

Let's say we use blob grouping only. Then what we need to avoid is the
perception of ends of blobs (words). 

Consider reading barcodes. They are tall enough that any grouping of the bars
will group everything together, so we can't use that. Yet, we are able to group
things based on the perception of end blobs. 

Why is it okay as long as the strength of end blobs is the same everywhere? Then
attention spreads either not at all, because letter blobs inhibit each other, or
via larger blobs. When competition between letters is so strong that it
overcomes spreading via large blobs, then word recognition breaks down.

Collinearity and blobs. In the middle of a word, there is collinearity sideways,
which spreads the attention across th eword, 

Texture perception is not particularly strong within the fovea/parafovea. We
will therefore focus on blob continuity perception. Texture perception is still
important for the overall design, but not required so much for spacing.

Collinearity is the result of line-detecting neurons; coboundarity is the
result of blob-boundary grouping cells highlighting sideways grouping cells.

We also want to think about the perceptivity of individual letters. 

At letter/stem scale, we want letters to be perceptible as single units without
attention jumping to other letters to easily.

At word scale, we want attention to flow easily across the whole word.

At pair level, this means equalizing how easily attention spreads between
letters at a x-height scale, without resulting in too much spread between
letters at a small scale.

At a small scale, we want to calculate how quickly attention envelops an entire
letter. 

One of the questions: how are letters represented in IT?

An i is represented as a single vertical line with a dot.

Why isn't the right outside of the i a left edge? There should also be an object
there. But there are many objects, and they are all weakly activated, and they
all compete with one another. Whereas the object on the inside is vertical and
strong.

There are object sideways contour recognizers, which don't compete with another.
And line recognizers.

So letter representation in IT.

l: vertical line.
o: curved line segments.
m: curved line segments;
s: curved line segments.

to recognize the line segments, which reinforce one another, we need
continuation of the skeleton.

- Skeleton of the line segments gets continued. Wherever horizontal crossings
  occur, need to figure out how the lines connect.
- The rounder each letter is, the more it is it's own entity, even if it
  connects with its neighbours. E.g. serifs on E, L, s.
- How does attention spread within an x? Crossing lines need to be accommodated.
  The brain is evidently able to deal with crossing lines, but will
  automatically assume that one is behind the other. Contrast can contribute to
  that illusion. But point is that two crossed-line elements will be active in
  V4 at the same time. The two will compete (if they are too close in angle).

- So we need to compute the likelihood of spreading between letters compared to
  the likelihood of spreading within the letter. Likelihood of spreading within
  the letter is based on competition between barely collinear pieces of the
  letter. By that measure, w (and perhaps e and m and s) have the most difficult
  time spreading. But also, spreading between v and v (vv) is quite unlikely.

- We don't want two letters (like oo) to be perceived as a single one.
  Why is it that at a most basic level, keeping them physically separate
  guarantees this? It must be the competition between nearby but not-connected
  straight pieces. What keeps a w as a whole? The wider and rounder the w, the
  more connected it is as a letter, but the corners are also important features.
  We know that a dedicated corner piece can connect unconnected lines; in other
  words, it can facilitate spreading instead of competition.

- We want to measure how quickly attention would spread from one letter to the
  next, or how one letter would inhibit the perception of a nearby letter.

- We want activity to spread along the stems/skeletons of both letters.
1. We want to be able to measure how quickly that is possible within a given
   standalone letter.
2. We want to be able to measure how that is *less* possible when a neighbouring
   letter is close, for a given range of scales.
3a. We perhaps want to measure how easily attention spreads from one letter to the next, e.g. when they are connected or almost connected. But that's probably not that important.

- We then want activity to spread between letters, at a larger scale. This
  larger scale involves the upper and lower boundaries of the letters. Focusing
  on a letter should automatically extend the activity sideways, and after
  spreading everywhere and waiting for a little bit, we want to measure how much it coalesces on individual word fragments, which it should not of course.
  At a pair level, this means trying to simulate the spreading of attention

- Question: how much does activity spread between letters word wise?

- V1 effect from linear tells us a little bit about that.
- That is because straight will affect straight, and round will affect round
  only in the meeting point, similar to how skeletons will affect one another.
  It does not incorporate the effect of thickness, because line continuity in V2
  and V4 responds differently to lines of different thicknesses. A letter stem
  can respond in V4 with a long, integrated skeleton contour, or it can be a
  stubby piece whose skeleton is a bunch of G cells pointing to outside borders.
  Point is, somehow in V4 the vertical nature of a stem is represented, and it points to the inside and outside energy cells (border-directed in V2) making
  up the stem. Then, both the border-directed contour integration cells in V2
  require no flankers, and in V4 the G cells are able to call out others.

  In other words: flanker suppression in V2 is sufficient, here. Question is:
  how can we implement flankers beyond classical RF?

- Then, we need to worry about continuity between letters. This is
both a question of collinearity in x-range and blob spread; i.e. the
ability to detect a connection between the letters. nn easy, straight
and straight. oo, difficult; we need to come up with a computational
way of assessing how easily activity can spread from letter to letter.
Again, the gap gain is a crude measure of this, because it represents
the width of the gap, and it is stronger across straight gaps than across oo.
It does not, however, understand the benefit of serifs, or the result of cases
like nl or ll, and that any change in descenders/ascenders make it harder to
group.

- Finally, we need to explain why serifs aren't required for good readability. 
The upside of serifs is that they increase word grouping. However, they aren't
needed, because our visual system needs a mechanism to cut the end of lines. 

    -------- 

How does this line not expand infinitely? 

[TODO] fix reference to predictive coding with reference to
analysis-by-synthesis (Zhaoping 2017) and flipped information flow (Heeger
2017). 

Chen 2017: https://www.sciencedirect.com/science/article/pii/S0896627317310322

say that V1 initially has lots of cells saying contour (with various
strenghts); then V2 has cells saying contour (maybe), then V4 has cells
saying contour somewhere here (probably), which can amplify (but not
generate) activations in V2 and depress (but not eliminate) activations
in V2 that are flanking. It takes a while for the center ones in V4
to get strongest, which will result in activation of on-line V2 and
depression of flankers.

Similarly, outside boundaries will form and combine to form candidate inside and
outside lines of various scales. Blob Gs of various sizes and blurs and object
centers will activate in V4, but most will compete with one another; only the
set of consistent G cells will enter a positive feedback loop with the best B
cells in V2.

Question: how can these two processes be combined into one, and run in a
reasonable computational time frame?

Also: how does this fit into the idea that texture plays a big role? Perhaps it
doesn't...

1. V1 linear filters.
2. V2 linear filters (based on convolution from V1) -- in particular, collinear
   filters
3. V4 linear filters (based on convolution from V2) -- in particular, collinear
   filters
4. Modulatory feedback from V4 to V2, in particular, reinforces the active V2
   ones, and modulatory feedback from V2 reinforces the active ones in V1. This
   is via multiplication.
5. Then there's divisive normalization competition within V2 and V4.

Let's apply the same model to B/G cells.

1. V1 linear filters.
2. V2 convolutional filters -- in particular, two opposing 

In V2, there are two kinds of opposition pairs: inside/outside edges (B cells),
and flanking contour lines. 

V1 linear line filters -> collinear line filters in V2 (compete with flanking
line filters)
V1 linear edge filters -> collinear edge filter pairs in V2 (compete with
flanking and opposite edge filters)

How does this work with complex/simple cells?

Complex cells make no distinction between skeleton and edges.

contour-G cells. Connected to a collinear set of collinear contours in V2.

How about outlined letters?

We need to figure out how border ownership cells behave when a full circle turns
into a ring.

Question: what if all lines were perceived as blobedges from both sides? What if
a single contour was the activation of two opposite B-cells? And what if there
was a particular type of G cell that can o

Normal G cells activate only the B cells that are on their outside, facing
towards the blobcenter.

Line G cells activate both partners of a B cell. There 

Circle: there is energy around the outside, which does not reveal the direction
of the edge. The more G blob cells agree, the more they reinforce one another,
reinforcing the inward-facing B cells, which kill the other B cells.

long oval: there is a whole set of G cells selecting B cells. Smaller G cells on
the side

No matter whether is edge or contour; it's where the energy is.

Even contours are objects. 

----------------------

Let's assume even regular contours are just objects, and anywhere where there's
energy to feed a B cell will be fed. In the center, B cells that are energy
which is fed both by the nearby G cells, and they compete with each other, being
able to oscillate between them.

In the center of a medium-thickness letter, it's the G-cells in V4 that
activate, and they benefit from connectivity in V2.

Now how does this affect the connectivity of two letters?

- There is a best connectivity/contour-integration distance, but even if a
  suboptimal distance is chosen, it results in uneven grouping. So for reading
  it's actually still okay as long as within each word the grouping is even,
  although that messes up the peripheral texture.

So. Now we need to address the blobness.

Blob spread is achieved by spread between G cells via B cells. If the G cell
from one letter (or one in between) is activated by the first letter, then there
is a connection.

How can that be measured effectively?


So: a line then has, at the end, a small end cut which competes with the
extension of G cells but strengthens the tip. 

Corners cannot be represented in V1. Question: how do corner units in V2 play
into the inhibition?

The question is: are two boxes perceived as a single box or as two boxes? And
that depends on whether there are two peaks or one.

Note that corner detectors in V4 are able to effectively spread activity between
even 90deg-aligned lines. Corners are, no doubt, V4 blob elements.

So we now need to train (?) in V2 a collection of collinear association fields,
and in V4 a collection of blobs, at different scales, with respective feedback
mechanisms all the way down to V1.

The question is then: absent attention, how do we measure the

a) the spreadability of attention throughout the pair, and 
b) the diminishment of letter features due to competition with bogus-hybrid
   features?

When the two boxes are extremely close together, the spreadability through the
whole pair becomes very easy, and the perceptability of each individual box
drops (i.e. at stroke scale). How do we reconcile that?

V1 model: we compare how activations differ between single and paired letters.

V4 model: 
a) we need to measure the recognizability of the boxes themselves. A box is a
combination of G cells at the same place of leftcontour, lefttopcornercontour,
topcontour, etc.
After pair steady state, we can look at increases and decreases in each G-type
channel.

b) we need to measure how easily activity spreads across the whole pair. 

nn vs oo: oo suffers less from flankers, and needs to be closer to spread
activity easily.

nn vs ll: both suffer the same amount from flankers proportionally to their
length; activity may spread more easily for nn because it may get some extra
boost from beyond-neighbours; ultimately, it seems that the amount of flanker
damage is the deciding factor here (but also, the closer the more difficult the
spread between nl and even ll).

IU vs UN: In both cases, flanker damage is important; thin lines may be 

(how does flanker damage occur? Is it the same as merging damage?)

IU vs UN. we want the same distance. In terms of spreading between the blobs, we
would compute the gains in G channels. 

The individual objects would normally prevent object spread. If attention is on
the first object, that inhibits the (weaker) gap G enough to make the first one
stand out; but hitting the first one with attention will 

V1 is more responsive to words than to nonwords: http://www.unicog.org/publications/szwed_et_al_Neuroimage_2011.pdf

We want, ideally, no reduction in the V4 G cells that make up either letter
(e.g. due to lateral inhibition between flanking B cells). We want to be able to
focus on a single letter and not have activity flow to the next letter ...
actually ... that's the case with script fonts. So although we may be able to
focus attention on a part of a script text that maximizes the recognition of the
letter we want, ... we may be more interested in maximizing the ability of
activity to spread across the whole pair, while limiting the reduction in
original G cells.

Two boxes. Original G cells are still available, and when focusing on center of
left box, it's very possible to just highlight the B cells of the left box.

But when attention is put on a center-of-five box, the other 

Although gyt hiklo pem griv kolp, 

Attention on center of ooooo. How strong are the 

Does the flanking competition make attention spread easier itself? It really is
about competition at the corners. 

perception of U:

V1 gets energy is various channels; V2 gets collinear activations; V4 gets
central blob activation and line activations. 


Take a U. Competition at V1, means outside edges and thin upstroke are most
active. They also activate opposing longsnakes in V2, which feed back and modulate the
longest pieces to be strong. These then are captured by grouping cells in V4,
which capture the skeleton of the letter on both sides. Also, at a blurrier V1
scale, both arms of the U are activated, allowing for some activation of a
large, blurry, G cell in the armpit of the U. But it's relatively weak,
especially for thin fonts, because the B cells are weak. 

When the center G is selected, that selects the V2 B cells on the
outside, which also selects the the sideways (arm) G cells, which are arguably
stronger. The arm G cells win slightly in competition with the center G cell,
but the center G cell may actually be an important component of recognition.

Activating the G cells also activates (by modulation) all the right V1 cells,
which are themselves connected to the (pre?)frontal cortex. That is the visual
image of the text.

When another letter is placed nearby, the ability of B cells to activate
on the inside of the stems will go down. This will lower the ability
of the stem G cells to form, and increase the ability of a gap-located
doublestem G cell to take over. The strong presence of such a thick
vertical G cell will draw salience, and may lead to the detection of the
wrong letter (e.g. nn -> m). The drop in salience of the small original G cells
will be penalized. The V1 measure is a good indication of where this will
happen, but doesn't take thickness and snakyness into enough account.

Such merging of lines happens more easily (less?) with horizontal lines; our
ability to pick up horizontal lines is generally stronger.

When the letters come close enough together, though, grouping at glyph level
becomes much more effective, and can (hopefully) increase everywhere. We
therefore need to measure grouping at letter level, too. We need to model the
flow of horizontal spreading.

The MENU example teaches us that the letter recognition mechanisms need to be
involved in the feedback, otherwise it doesn't work. 

So we group letters into words even when there is background noise. What does
this mean?

Old theory: competition between V4 neurons lead to grouping of smaller things
over larger things. Attention can activate only the small thing, or flow along
a larger thing.

New theory: activity can flow from one letter to the next, and the background is
actively suppressed.

Letters reinforce V4 neurons that see letters, which suppress everything else.
And between the neurons that see letters, 

How is a single vertical line perceived? G cells down the middle take B input from left and right.
G cells compete sideways

Half of the neurons in V2 are border selective. 

Mihalas' paper tells us more about how attention affects the inhibition between
G cells.

7% increase to G cells from attention is what was observed in testing.

Simulation of a visual field of 64x64 takes 54528 coupled differential
equations, which become steady at around 100ms. They only used vertical and
sideways orientations (should probably also have 45deg?) and only one scale of
energy (could perhaps be justified via CSF?).

So. We still need to explain how different scales of G cells compete.

The competition between neighbouring G and B cells is difficult to put into a
straight equation ... but perhaps it can be done?

When neurons only compete laterally, the steady state can be approximated by
divisive normalization formulas.

Now: V1 -> B population -> G population coupled. How to do this?

Each neuron in the population depends on each of the other neurons in the
population. We can build a linear model that is cut off after each step, and
integrate. We can use Python TF TFP ODE for that. 

We have several populations of neurons: multiple V1 sizes and orientations,
translating to two types of B cells of orientations, and G cells of sizes.


Simple model: V1 -> V1 DN -> B cells -> B cell DN (bipole) -> G cells -> G cell DN -> B
cell feedback -> V1 feedback.

We then compute this for each individual glyph and for the pair, and look at
where G cells are lost (bad, especially at stem sizes) and gained (good, but
only if large sizes).

Can we assign border ownership explicitly? As in, every point along the outline
has a sense of directionality and a curvature. Assume we can compute from this
the strength/orientation/direction of B cells. Then compute the G cells from
that. 

Or can we use Tensorflow ODE for this? 

Build the whole model exactly like what Mihalas did.

Now nn vs nl vs ll.
- Loss in stemsize G cells:
  Bipole competition between inner B cells should be relatively small;
  competition between (large) gap and (small) stem G cells works out such that
  whatever the stem loss is, it should be comparable between nn and nl, and
  larger in ll.
- Gain in xsize G cells:
  nn: some gain in the center. nl: some gain in the center, little less, perhaps
  adds a larger G cell. ll: some half-adding at bottom, some half-adding at top,
  but this is the same as the one that competes with the stems.

nn vs. ll vs db:
- Loss in stemsize G cells: same everywhere. Do ascenders not count?
  
- Gain in xsize G cells: not enough, which is why we only care about loss in
  stemsize.

Consider a simple sans font. Why make the space the same between all straight
stems? How is this understandable using this model? 


Grouping cells inhibit one another in two different ways: smaller G cells
inhibit larger ones at the same location; larger G cells inhibit smaller ones
that share a tangent with the larger one. 

(How to use G cells to simulate skeleta: https://sci-hub.tw/10.1109/CISS.2012.6310946)


What if the Brian Hu model is correct. Some grouping cells detect object centers, others detect contours. 

Letters are detected when either the contour grouping cells or the object
grouping cells form a letter. 




## The direct effect of pair distances on the primary visual cortex


Of course, this interference is only a concern for cells with receptive fields
affected by both letters. Receptive fields that are smaller than the gap itself are
not affected:

[image]

In other words, signals representing smaller frequency scales are only affected
when letters are very close together, while large scales see a a reduction at
larger distances too:

[image]

Research has shown that humans rely mostly on the mid-size scales for letter
 recognition.{sn}This is widely
 recognized, but perhaps most clearly described in
 [this](https://jov.arvojournals.org/article.aspx?articleid=2122458) article 
 by Oruç and Landy and
 [this](https://jov.arvojournals.org/article.aspx?articljeid=2191906) article by
 Legge and Bigelow.{/sn} Extra-fine
details like serifs are relatively unimportant. We can therefore assume that loss
in mid-size signals is most detrimental to the letter detectors:

[image]

Of course, "mid-size" is relative to the font size, tying in the
idea of optical sizing: At larger font sizes, smaller details shift into the
mid-size range of spatial frequencies and dominate letterfitting decisions,
whereas at very small sizes, it is entire letters that dominate. We could think
of three broad regimes: serif-serif interference, stem-stem interference, and
letter-letter interference.

[Show orientation-based examples, esp. of pairs like LT or VA]

How exactly does the energy loss in certain locations, orientations and scales
affect the activation strength of the letter detectors? This is a difficult
question to answer, because we have no precise knowledge of all of the neural
computations performed between the retina and the visual word form area.
Generally, we can assume that the loss at the letter detector is nonlinearly related to the
weighted sum of the energy loss, and estimate the weights via backpropagation
against existing fonts. Weights could span the spatial frequency scales and
orientations, or (in addition) the vertical axis. Weights could even incorporate
full saliency maps for each letter, although that is best done using 
the kernels of pre-trained letter detectors, for re-usability.

One approach, for instance, would model the total loss at the letter detector as
the complement of a hyperbolic ratio function, with parameters that differ for
each letter.

## Towards new letterfitting models

* Simplest: use V1 model only; equalize loss in weighted scales across pairs.

* Use V1 model only; use function approximator (NN, polyharmonic spline) to
  weight losses in small scales against losses in large scales.

* Use V1 model for lower bound on pair distances only; additionally, use a
  modified version of the V2 statistics model to estimate the pair's appearance.


## Results

(Come back soon!)

## Parameter tuning

(Come back soon!)

## YinYangFit, the tool

(Come back soon!)


<a name="existing_tools"></a>

<h2 class="appendix">Appendix: Existing letterfitting tools</h2>
Most existing approaches operate either on the distance between stems, or on the
area of the gap between them. Some are hybrids, more complex, or unpublished;
finally, there has been some experimental work using neural nets:

<img src="img/heuristics_classification.png"
alt="Heuristics" />

**Fixed-distance methods:** A family of approaches that insert pre-defined distances
between letter pairs. In their simplest incarnation, these heuristics are
equivalent to simply adding sidebearings to every letter, without any kerns.
[Kernagic](https://github.com/hodefoting/kernagic), inspired by [Frank
Blokland's research](https://www.lettermodel.org/), uses heuristics to identify
stems or stem-equivalents (such as the round sides of an o) in every letter
shape, and then aligns them. This works reasonably well with very regular type
(think blackletter), but manual adjustments are usually required. Less well
known is Barry Schwartz' [anchor point
implementation](https://github.com/chemoelectric/sortsmill/blob/master/tools/spacing_by_anchors.py)
of what amounts to basically the same idea. Adrian Frutiger, Walter Tracy and Miguel Sousa have
devised similar systems, described in Fernando Mello's [MATD
thesis](http://www.fermello.org/FernandoMello_essay.pdf).
The legendary [Hz-Program](https://en.wikipedia.org/wiki/Hz-program) is also
included in this category, as its [patent application](https://worldwide.espacenet.com/publicationDetails/originalDocument?FT=D&date=19941019&DB=&locale=en_EP&CC=EP&NR=0466953B1&KC=B1&ND=1#)
reveals that letter pair distances were simply stored in a hardcoded table.

**Gap area quadrature:** A family of algorithms that attempt to quantify and
equalize the perceived area of the inter-letter gap. The crux, of course, lies
in deciding where the gap ends. [HT
Letterspacer](https://huertatipografica.github.io/HTLetterspacer/), the crudest
one of these tools, considers everything between baseline and x-height (modulo
some minor refinements). Simon Cozens'
[CounterSpace](https://github.com/simoncozens/CounterSpace) uses blurs and
convex hulls to more effectively exclude regions that arguably don't belong to
the gap (such as the counter of c). My own [Electric
Bubble](https://www.aldusleaf.org/2019-03-17-letterfitting-attention-model.html)
model measures Euclidean instead of horizontal distances, but imposes geometric
constraints that produce similar results to CounterSpace. CounterSpace currently
wins in terms of performance-complexity ratio but it, too, struggles to fit
certain letter pairs.

**Other shape-based methods:** These include more exotic approaches, such as stonecarver [David
Kindersley](https://en.wikipedia.org/wiki/David_Kindersley)'s "wedge method"
from the 1960s, which operated on letter area moments of inertia (and didn't
really work), and [iKern](https://ikern.com/k1/), which produces great results
but, just like Adobe's [Optical
Kerning](https://typedrawers.com/discussion/3006/how-does-adobes-automatic-optical-kerning-work)
feature, remains unpublished. Last but not least, the [TypeFacet
Autokern](http://charlesmchen.github.io/typefacet/topics/autokern/typefacet-autokern-manual.html)
tool identifies parts of letter outlines that jut out horizontally, and adds
kerning to compensate, based on a few parameters.

**Neural nets:** Yes, we can train convolutional nets to recognize images of well-fitted
and poorly-fitted type. Simon Cozens has built several versions of his
[kerncritic](https://github.com/simoncozens/atokern) model (formerly AtoKern), and
the recent ones perform surprisingly well on many (if not all) pairs.
While neural nets are fascinating, they tend to be black boxes: we can only make
guesses at how they work, and we cannot tune their behaviour to suit our taste.
This problem holds not just for convolutional nets, but for statistical function
approximators in general; I do not discuss them further here.

**Honorable mention:** [Bubble
Kerning](https://groups.google.com/forum/#!searchin/comp.fonts/laurence$20penney$20kern/comp.fonts/GEjTE9_H52M/BSLdSE2lgmsJ)
is a proposal that type designers draw a bubble around every
letter, such that software can automatically find pair distances by simply
abutting the bubbles. While this isn't technically a letterfitting heuristic at
all, it's still worth mentioning as a neat idea that could perhaps save
designers some time. Toshi Omagari has built a [Glyphs plugin](https://github.com/Tosche/BubbleKern).
