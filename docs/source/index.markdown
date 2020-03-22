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

<p class="missing">
Sensitivity to frequency scales and orientations (CSF models, Watson and
Ahumada, Chung et al., etc.)
</p>

<p class="missing">
Divisive normalization for contrast normalization (Sawada and Petrov)
</p>


## Area V2, Portilla-Simoncelli texture correlations, and crowding effects

Area V1 deconstructed the incoming imagery into thousands of edge and line
fragments. Area V2 helps find patterns in those signals, patterns that form the
basis for the perceptual grouping effect we are interested in.

Each neuron in V2 takes its input from a combinations of neurons in
V1,{sn}Again, we will skip here a discussion of the various layers and
interneurons of V2.{/sn} creating receptive fields that can be twice as
large as those in V1. The choices of V1 inputs are (nearly) endless, and
indeed, V2 contains a vast variety of neurons representing all kinds
of different correlations between V1 neurons: correlations between
simple cells and complex cells, between cells of different scales and
orientations, and between cells at different spatial locations.

[image]

Presumably, the ability to respond to correlations of inputs from V1 is
conferred to V2 neurons by their nonlinear activation curve. Consider a toy
example in which two V1 neurons each fire with rates between 0 and 1.0. Then a V2
neuron with the following activation curve would fire only if *both* inputs are
sufficiently active, summing to at least 1.5, thereby implementing correlation:

{mn}Anthony Movshon and Eero Simoncelli [call
this](10.1101/sqb.2014.79.024844) the "cross term", referring
to the $ab$ in the $(a+b)^2 = a^2 + 2ab + b^2$ expression that
arises in simplistic square-based activation models. The dashed line shows the
deep-learning equivalent expression $\mathrm{ReLU(x-1.0)}$.{/mn} <img
src="img/v2_nonlinearity.png" alt="Nonlinear activation of V2 neurons
enables computation of correlations">

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

{mn}Here, Javier Portilla and Eero Simoncelli demonstrated how a set of V2 statistics
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

Still, V2 statistics matter. Not only might they serve as a very useful tool
to optimize visual consistency during the type design process itself—a
topic for another research project!—but they are intimately related to
perceptual grouping through a phenomenon called *crowding*, which we will
address later.

<p class="missing">
Surround suppression from uniform textures (Coen-Cagli et al., etc.)
</p>

## Contour integration and V1 feedback

Not all V2 neurons respond to peculiar V1 correlations expressing elements of
texture. Some pick up on more obviously salient signals, such as continuous
edges and lines. Experiments suggest that they do so by responding to V1 complex
cells that co-align:

{mn}Each cell corresponds to a V1 complex cell tuned to a certain
orientation (the distribution in frequency scales is ignored here).
Note that the number of V1 cells is exaggerated for effect. This neuron
responds to collinear V1 activations suggesting the presence of a
horizontal contour, even if curved (as in the sample shown). It may be inhibited by parallel
flanking contours and perpendicular contours, although this is less
clear. This pattern has been called "association field", "bipole",
and many other names in papers going back to the 1990s.{/mn} <img src="img/v2_contour_integration.png"
alt="Receptive fields of a V2 contour integration neuron">

This allows these V2 cells to detect continous contours, even if these
contours are curved or interrupted.{sn}Two studies showing this most clearly are by [Minggui Chen et al. in 2014](https://doi.org/10.1016/j.neuron.2014.03.023) and by [Rujia Chen et al. in 2017](https://doi.org/10.1016/j.neuron.2017.11.004).{/sn} Interrupted contours are a constant
challenge to the vision system: not only can the edges of an object be
occluded (e.g. tree branches in front of a mountain), but our retina is
carpeted with a spider web of light-scattering nerve bundles and capillaries.{sn}Not to mention our
[blind spot](https://en.wikipedia.org/wiki/Blind_spot_(vision)).{/sn}
Contour-integrating V2 cells therefore allow us to perceive contours even where we cannot
actually see them.

{mn}<img src="img/contour_integration_example.png" alt="Contour
integration example">Typical contour integration test image. Adapted
from [Roudaia et al.](https://doi.org/10.3389/fpsyg.2013.00356),
2013.{/mn} Having thus detected a piece of contour, the V2 neuron
now sends an amplifying signal to all of its V1 inputs, which
in turn increases the input to the V2 cell itself, creating a
positive feedback loop between V1 and V2. Crucially, however,
this feedback only amplifies neurons that are already firing; it
does not induce activity in other inputs (and may even suppress
them).{sn}Physiologically, this kind of modulatory amplification may be
related to increased spike synchrony between neurons, as explored in
[this 2016 study](https://doi.org/10.1152/jn.01142.2015) by Wagatsuma et
al.{/sn} Thanks to this feedback loop, contiguous contours pop out to
us perceptually in a matter of milliseconds, while non-contour features
(like the dot in the illustration below) do not:

<img src="img/v2_contour_integration_2.png">

As we will see, this kind of feedback loop is a key ingredient in
perceptual grouping.

## V4 and higher-level areas

The next area of the visual cortex, area
V4,{sn}This discussion is limited to the [ventral
stream](https://en.wikipedia.org/wiki/Two-streams_hypothesis), i.e.
parts of the visual system dedicated to object recognition. The dorsal
stream, on the other hand, comprises areas concerned with keeping track
of our environment and our position in it; it appears to be irrelevant
to letterfitting.{/sn} is similar to V2 in that it performs a set of
convolutions detecting correlations between its inputs.

Experiments, mainly on macaque monkeys, have revealed that V4 neurons detect two
kinds of visual features: textures and object-centered contour
fragments.{sn}Our understanding of this is primarily owed to Anitha Pasupathy and
her collaborators, who have been published results like [this one](), [this
one]() and [this one]() for nearly two decades.{/sn}

<p class="missing">
Show examples, e.g. Kanizsa square/triangle
</p>

<p class="missing">
Texture coding; hypothesize fovea/periphery distribution
</p>

## Grouping via border ownership

<p class="missing">
Explain grouping via border ownership (von der Heydt et al., Mihalas, Hu)
</p>

<p class="missing">
Fuzzy circular grouping cells (Craft et al.) vs. inferotemporal integration of V4 as G cells
</p>

<p class="missing">
Perception of lines vs blobs
</p>

<p class="missing">
Skeletonization (medial axis detection) and cross-inhibition of G cells
</p>

<p class="missing">
Classification vs. representation; V1/V2 as a blackboard (Roelfsema 2016)
</p>

## From perceptual grouping to letterfitting 
The above model of our vision system's perceptual grouping mechanisms finally
allows us to make some predictions about typographic truths, and should
ultimately allow us to build a robust, biologically plausible letterfitting
tool.

<p class="missing">
Competition between word-scale and stem-scale grouping cells
</p>

Let's see how our current understanding of perceptual grouping plays out
in some axiomatic letter pairs:

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
</p>

## Intuition for grouping: crowding, attention, and the spread of activity

<p class="missing">
Review crowding and classic hypotheses of feature pooling and cortical
magnification
</p>

<p class="missing">
Review Herzog lab papers; effect of regularity on crowding (Sareela et al. 2010) and uncrowding via LAMINART grouping (Francis et al.)
</p>

<p class="missing">
Offer intuition for perceptual grouping of words and crowding as related effects
of lateral spread of neural activity.
</p>

<p class="missing">
Review the concept of attention, and its ability to affect the spread (both
facilitatory and laterally inhibitive, see e.g. Mihalas et al.)
</p>

## Why word grouping matters: models of reading

So far, we have described some important neural dynamics of the visual cortex,
between V1 and the early inferotemporal cortex. Experimental results have
yielded rich hypotheses about the neural architecture of perceptual grouping,
hypotheses that appear to explain many aspects of letterfitting practice.

But the patterns of neural activity involved in reading don't stop at the edge
of the visual cortex: about a quarter second after we first see a word, neurons
in the so-called *visual word form area* in our left fusiform gyrus (see
the anatomical illustration above) have settled the identity of the word.

The visual word form area contains neurons that identifies letters
and words. Understanding how this works may help us refine our
model to make it aware of semantic issues that can affect design
decisions. The primary issue is confusability (e.g. between *rn*
and *m*), but we can look beyond alphabetic letterfitting to the
relative placement of accents, and even to the strokes and components
of Hangul and Hanzi—all of these are instances of the problem
of competitive perceptual grouping.{sn}The recognition of Chinese
characters takes place in the *right* fusiform gyrus, a region
traditionally associated with face recognition (although [EEG
readings suggest that face-recognition circuitry isn't directly
involved](https://doi.org/10.1371/journal.pone.0041103)). The
compositional mechanisms described here likely transfer in principle,
however.{/sn}.

<p class="missing">
Describe the latest reading model (overlap-based n-gram hierarchy; Graigner,
Gomez et al.); reference letter transposition studies.
</p>

<p class="missing">
Comment on the role of word dividers/breaks, or the lack of them, in different languages;
linguistic reasons for their necessity/absence.
</p>

## Building practical letterfitting algorithms

Unfortunately, the dynamism of the scientific model(s) introduced thus far makes
them unsuitable for use in practical letterfitting tools for type designers.
Although it is relatively straightforward to set up systems of coupled differential
equations representing individual neurons, integrating them at a sufficiently
fine spatial resolution is immensely costly, and doing so over many iterations for
each letter combination is outright infeasible, at least with consumer-grade
hardware. We must therefore consider potential approximations to the model.

<p class="missing">
Brief nod to existing solutions in the appendix, and how they happen to
approximate (or not) some of the model characteristics discussed.
</p>

<p class="missing">
First option: use only difference in V1 complex cell activations, weigh based on
orientation and size. Pair gains approximate word-scale grouping strength, pair losses
approximate stem-scale losses. Does not consider contour pop-out or actual
grouping dynamics; does quite poorly on uppercase letters. However,
straightforward to train on existing fonts via backprop. Show some results.
</p>

<img src="img/abstract.png">

<p class="missing">
Brief nod to residual nets, which effectively unroll the dynamics over a few fixed time steps. Also mention Ricky Chen's Neural ODE option.
</p>

<p class="missing">
Potentially feasible: one forward sweep; V1 → V1 DivN → V2 →
contour integration DivN → grouping via fuzzy circular G cells → feedback to V2
B → update G cells. Take difference between pair and letters; weight and
integrate; backprop-fit against existing fonts. Show some results.
</p>


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
