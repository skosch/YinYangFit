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
infinite variety of typefaces, designers still need to rely on their intuitive
judgment.
I review how letterfitting fits into the current scientific understanding of how
letters and words are perceived in the brain, and present approximate models
that can be fitted to to existing, hand-fitted fonts using backpropagation.

<h2 class="nonumber">Target audience</h2> 
Designers and developers with an interest in neuroaesthetics.

<h2 class="nonumber">Epistemic status: provisional</h2> 
This article is based on a survey of hundreds of peer-reviewed articles, 
and in line with mainstream ideas in vision and neuroscience research. It is the
product of many months of work and countless revisions. That said, even the
in-vivo evidence for the suggested models is often indirect or circumstantial.
Nothing in this article should be construed as final. I welcome corrections!  

## Introduction: 

Letterfitting refers to the process of adjusting the distances between pairs of
letters{sn}I use the word "letter" very liberally; the more general term is
[glyph](https://en.wikipedia.org/wiki/Glyph).{/sn} during typeface design.
{mn}<img src="img/spacingkerning.png" alt="Spacing and kerning"><br> Red
vertical bars show side bearings, blue vertical bar shows a negative kern.{/mn}
It's often referred to as "spacing and kerning", because pair distances are the
sum of fixed amounts of space around every letter (so-called *side bearings*)
and additional adjustment values for individual pairs (so-called *kerns*).
Quality fonts often contain thousands of hand-kerned pairs that undergo weeks of
testing and refinement, all by hand—because surprisingly, there still are no
automated solutions that reliably do the job.{sn}And not for lack of trying:
many approaches exist, the most popular of which are listed in the
[appendix](#existing_tools) below.{/sn}

The heart of the problem: typographers can't even agree what letterfitting
*does*. Some say that it's about achieving a certain *balance* between letter
pairs, the judgment of which is to spring from the designer's personal aesthetic
intuition.{sn}It goes without saying that as for the design decisions of professional
typographers, *non disputandum est*. This is the premise behind the
venerable [kern game](https://type.method.ac/).{/sn} Others say that the goal is
to produce an "even colour", i.e. a printed page with a uniform texture and
without noticeable blobs of black or white. Yet others have insinuated{sn}First
and foremost Frank Blokland, who in his [PhD
thesis](https://www.lettermodel.org/) investigated how practical considerations
in the Renaissance printing trade may have led to a standardization of font metrics.{/sn}
that the distances between letter stems are really quite arbitrary, and that we are simply
conditioned by existing fonts to (prefer to) read letters at particular pair distances.

All three of the above descriptions seem to point to the same
story: that skilled designers achieve a pleasing visual balance between letter pairs
because they have honed their perception through the careful study of existing
fonts, and that perfectly balanced letter pairs also happen to result in perfect
legibility and a perfectly even typographic colour. Does that story hold water?

As it turns out, research suggests that colour, balance, and legibility have
*different* neural correlates. They are often in rough agreement, but optimizing
for one does not guarantee a good outcome for the others. Evenness of colour is
a question of texture perception; quality of balance is a question of
competitive inhibition between perceptual gestalt groups; and legibility is a
question of the reliable detection of letters and n-grams from pre-processed
visual features. On top of that, all of the above are affected differently by
font size and colour contrast.

If we want to develop robust, universal automatic letterfitting <nobr>algorithms—</nobr>algorithms that
work on both hairline slab serifs and broad-nib italics, on both captions and headline
sizes, on both Latin and Hangul—then we need to build better intuitions for the neural
dynamics of our vision system. That's what this article is about.

In a way, it is surprising that type design and cognitive psychology are so
divorced from one another.{sn}The studies that do exist are almost exclusively
empirical (see e.g. the [review of legibility
studies](https://www.sciencedirect.com/science/article/pii/S004269891930 1087)
compiled recently by type legend Charles Bigelow) but have no explanatory power.
In fact, the typesetting of most preprints suggests that cognitive scientists
are altogether unaware of typography as a discipline.{/sn} Computational models
of vision and reading need to be tested against ground-truth data, of which
existing fonts are a rich, reliable, and free source. Conversely, type designers
could massively benefit from tools that emulate aspects of human vision. I hope
to see much more cross-fertilization between the two fields in the future.

## A letterfitter's objectives 

Before we dive into the science, let's review how the three ideas fit into
a broader cognitive science context.

Typographic colour refers to the visual texture created by the ink on the page.
Most obviously, a darker colour is the result of bolder, narrower, more
tightly-fit type. But the line spacing contributes to a document's
characteristic texture as well, and so does the angle of the letters (i.e.
upright vs. italic) and, ultimately, the design of the individual letters.
Some design teachers like to give colour-based letterfitting prescriptions, like
"match the black and the white" or "equalize the negative space in the counters with the negative space in the
gaps."{sn}Like horoscopes, these rules only work when they are formulated vaguely enough to
be useless.{/sn} As we will see later, these heuristics are actually a primitive version of the kind
of spatial frequency correlations that form the basis of texture perception.

Next, balance. The brain has a general tendency to group visual features into perceptually coherent objects.
Meanwhile, the typographer's job is to group letters into perceptually coherent words.
When the letters are fitted poorly, the perceptual grouping into words will
fail: this we call poor balance.

{mn}Here, the saturation of the coloured blobs indicates the intensity of
grouping at different scales. Small perceptual groups tend to outcompete larger
ones, so unless the grouping is balanced, the word will be fragmented. The poorly fitted word in the last column triggers the perception of two separate objects, namely the single letter c and a pair at.{/mn}
<img src="img/grouping_relativity.png" alt="Illustration of the importance of consistency of fit vs absolute distances.">

Perceptual grouping networks are a very fundamental piece of our vision
circuitry, and not exclusive to reading. Researchers have known about them for a
long time, too: psychologists over a century ago described our tendency to
recognize the sum, not the parts, of arrangements of shapes:{mn}These are often
listed as the [Gestalt laws of
grouping](https://en.wikipedia.org/wiki/Principles_of_grouping), or the
principle of
[Prägnanz](https://en.wikipedia.org/wiki/Gestalt_psychology#Pr%C3%A4gnanz).
Because these early Gestalt psychologists knew little about the brain's vision
system, they hypothesized about their findings using sometimes abstruse
metaphors drawn from electromagnetics, fluid mechanics, and even personality
studies—in fact, their vocabulary of lights, shadows, and force fields closely
matched that often employed to justify today's letterfitting heuristics. I recommend
Johan Wagemans et al.'s fantastic two-part historical review of Gestalt
psychology, published in 2012 ([part
I](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3482144/), [part
II](https://dx.doi.org/10.1037%2Fa0029334)).{/mn} <img
src="img/gestalt_laws.png" alt="Illustration of gestalt laws" />

Finally, legibility. Children first learn to recognize individual letters as
physical objects, then learn to associate these objects with sounds, then learn
to reproduce the sounds letter by letter, and finally become skilled readers by
developing neurons that detect, as a shortcut, combinations of letters directly.
Each one of these developmental steps builds on the next by repurposing a
different area of the brain. A type designer manipulating a letter shape will
perceive it as a geometric object (like a child), but an adult reading the
newspaper perceives combinations of letters in parallel (or almost in parallel)
using entirely unrelated neural circuitry. These letter-combination-detecting
neurons work best, of course, on letter pairs that resemble those seen in the
past. It would be unwise to ignore this conditioning effect, but fortunately we can
fit primarily for Gestalt and still achieve great legibility simply because
other fonts were designed by humans, and therefore fit, by and large, for Gestalt as well.

## A brief tour through our visual system: area V1

Our brain's visual processing system is divided into multiple regions, each of
which represents the incoming visual imagery at a different level of
abstraction. Anything we see—landscapes, patterns, text—activates neurons in
each one of these brain areas. While neurons in the lower-level areas respond to
concrete details in the visual input, neurons in higher-level areas respond to
the presence of particular configurations of such details. Both low- and
higher-level areas are involved in perception, allowing us to simultaneously
experience the raw visual qualia *and* comprehend what we see on a more abstract
level.

Whether we are looking at an apple (and recognizing it as such), a tree
(and recognizing it as such), or a word (and reading it)–most of of the neurons
involved are the same.

{mn} All visual input activates several pieces of visual cortex before reaching
dedicated object-detection circuitry such as the Visual Word Form Area (VWFA).
We will discuss mainly V1, V2, and V4 (the so-called [ventral
stream](https://en.wikipedia.org/wiki/Two-streams_hypothesis)); many other
regions exist that are dedicated to visual tasks less relevant to reading, such
as keeping track of moving objects. This big-picture view of reading was perhaps
most clearly articulated in [this 2003
article](https://doi.org/10.1016/S1364-6613(03)00134-7) by the prolific reading
researchers McCandliss, Cohen and Dehaene. As we will discuss later, the VWFA is
actually multiple areas.{/mn}
<img src="img/vision_model.png" alt="Vision model">

Many readers may have had some exposure, however superficial, to the concept of
deep convolutional networks. It is tempting to conceptualize the
architecture of the visual cortex as such a network: yes, raw visual input
enters at the bottom, undergoes convolution through multiple layers, then comes
out the top as a neat classification of a word. 
But perception, and perceptual grouping in particular, is a dynamic
process. It is not a computation with input and output, but a dance of
electrical activity that evolves through time.{sn}[This interactive
visualization](http://nxxcxx.github.io/Neural-Network/) is far from
realistic but a much more useful visual metaphor than feed-forward deep
learning diagrams.{/sn} At high resolution, it unfortunately takes unworkably large computational
resources to simulate these dynamics accurately, so feed-forward convolutional nets may well
end up playing a role in the design of letterfitting models, but for now, the
goal is to gain an appreciation for our neural feedback loops.

With that in mind, let's go on a brief tour through our visual system.

Sensory input from the eye travels up the optic nerve, through
the lateral geniculate nucleus (LGN) on the brain's thalamus,
to the visual cortex at the very back of the head.{sn}For our
computational purposes, we will ignore any image processing
performed by the retina and thalamus, such as the luminance
adaptation and pooling operations performed by [retinal ganglion
cells](https://en.wikipedia.org/wiki/Retinal_ganglion_cell).{/sn}

{mn}Illustration adapted from Nicolas Henri Jacob (1781–1871), *Traité complet de l'anatomie de l'homme comprenant la médecine opératoire, par le docteur Bourgery*. Available in the [Anatomia Collection](https://anatomia.library.utoronto.ca/) of the Thomas Fisher Rare Book Library, University of Toronto.{/mn}
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
somewhere in the field of vision.{sn}This is a relatively well-known
concept, because the same kinds of receptive fields tend to emerge in the first layer of
image-classifying convolutional networks. For those readers completely
unfamiliar with these ideas, I recommend watching [this introductory
animation](https://www.youtube.com/watch?v=NnVLXr0qFT8), followed by
[this Allen Institute talk](https://www.youtube.com/watch?v=mtPgW1ebxmE)
about the visual system, followed by [this in-depth MIT
lecture](https://www.youtube.com/watch?v=T9HYPlE8xzc) on the anatomical
details.{/sn}

<img src="img/edge_line_rfs.png" />

These neurons are called *simple cells*, and we can easily predict
their response to a given input, depending on the tuning and location
of their receptive fields.{sn}David Hubel and Torsten Wiesel
first discovered this in the 1950s by showing patterns of light
to a cat after sticking electrodes into its brain (Youtube has a [video of said
cat](https://www.youtube.com/watch?v=Yoo4GWiAx94)). The researchers went
on to win a Nobel Prize for their experiments.{/sn}
In software models, the filtering operation performed by
simple cells is typically implemented as Fourier-domain
multiplication with a bank of complex band-pass filters, each of which is tuned
to a particular orientation and spatial frequency. Given a dark vertical bar as
visual input, sets of similarly-tuned V1 simple cells might respond as such:

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
the expense of colour and contrast data. They respond wherever the frequency scale and
orientation matches their tuning. In the following picture, all complex cell responses of
a given frequency scale are shown together, regardless of the orientation:

<img src="img/single_i_complex_example.png" />

Coincidentally, contrast and colour are irrelevant to reading—we
can read black-on-white just as well as white-on-black—suggesting
that it is mainly complex cells that provide the relevant
signals to higher-level brain areas.{sn}In practice, it is
measurably easier to read dark text on light backgrounds. Not
only do light backgrounds make the pupil contract, [creating a
sharper image](http://dx.doi.org/10.1016/j.apergo.2016.11.001),
but V1 outputs are also [stronger for darker
colours](https:///doi.org/10.1523/JNEUROSCI.1991-09.2009), which may
contribute to shape perception in higher-level stages. Nevertheless, reading is
primarily shape- and not colour-based.{/sn}

To be clear, this does not mean that the signals from simple cells
are lost or discarded. Just like the signals from colour-detecting
cells in the so-called *blob* regions of V1, which are not further
discussed here, the signals from simple cells do contribute both to our
experience of vision and to the activity of higher-level brain regions.
For reading (and thus letterfitting) purposes, however, we will focus on
the responses of complex cells.

Neurons in V1 (and elsewhere in the cortex) use lateral connections to inhibit
their neighbours. This is called *lateral inhibition*. Because the strength of
the inhibition depends directly on the strength of the neuron's own activation,
this setup helps the most active neuron to mute its neighbours. This sharpens
the response landscape, which is necessary in practice considering that neurons
tuned *almost* to the right orientation and frequency (but not quite) will still
fire quite a bit, effectively adding noise to the signal. Lateral inhibition
means that V1 neuron's firing rates take some time to stabilize, something that
models may need to take into account.

{mn}<img src="img/csf.png" alt="Contrast sensitivity function">Contrast
sensitivity function. The vertical gradient in contrast is uniform
across the image, but we most easily perceive the mid-frequency gratings
even at lower contrasts. Note that the red line, shown here only
for illustrative purposes, may not match the contrast sensitivity
function you experience at your current viewing distance and screen
settings.{/mn} Another aspect of vision that appears to manifest quite
early during visual processing—setting aside the optical limitations
of our eye—is our specific sensitivity to spatial frequencies. Humans
respond particularly well to angular frequencies of about 2–5 cycles
per degree, and unsurprisingly this translates to reading speed as well,
*especially* under low-contrast conditions.{sn}See studies like [Chung
and Tjan (2009)](https://doi.org/10.1167/9.9.16), [Oruç and Landy
(2006)](https://doi.org/10.1167/6.6.118), and many others.{/sn} This,
of course, is a key reason why e.g. hairline type is difficult to read
at smaller-than-huge sizes and a comparatively wide fit. The reader's
contrast sensitivity function may in fact contribute to the exact relative
weighting of the laterally-inhibitive connections; in other
words, mid-scale signals may outcompete fine-scale signals by default.
Even lacking perfect information about such correlations, we can point
to the contrast sensitivity function as the most basic biological *raison
d'être* for optical sizes in typography, and to models based on spatial frequency
channels as a natural fit for this aspect of letterfitting.

We will return to the question of how V1 outputs vary in response to
changing pair distances in a later section. For now, let's move on to how these
signals are processed in subsequent areas.

## Area V2, Portilla-Simoncelli texture correlations, and crowding effects

Area V1 deconstructs the incoming imagery into thousands of edge and line
fragments. Area V2 helps find patterns in those signals, patterns that form the
basis for the perceptual grouping effect we are interested in.

Each neuron in V2 takes its input from a combinations of neurons in
V1,{sn}Again, we will skip here a discussion of the various layers and
interneurons of V2.{/sn} creating receptive fields that can be twice as
large as those in V1. For each V2 neuron, the choices of V1 inputs are endless
(within the constraints of approximate retinotopicity), and
indeed, V2 contains a vast variety of cells representing all kinds
of different correlations between V1 signals: correlations between
V1 simple cells and complex cells, between V1 cells of different scales and
orientations, and between V1 cells at different spatial locations.
{mn}<img src="img/v1_v2.png" alt="Connections from V1 to V2">V2 cells take their
input from a nearby V1 cells, correlating receptive fields across dimensions of space,
simpleness/complexity, orientation, and spatial frequency scale.{/mn}

Presumably, the ability to respond to correlations—not just sums—of inputs from V1 is
conferred to V2 neurons by their nonlinear activation curve. Consider a toy
example in which two V1 neurons each fire with rates between 0 and 1.0. Then a V2
neuron with the following activation curve would fire only if *both* inputs are
sufficiently active, summing to at least 1.5, thereby implementing correlation:

{mn}Shown on the left is another hyperbolic ratio function.
But even simple squaring nonlinearities would allow computing
correlations; Anthony Movshon and Eero Simoncelli [call
this](10.1101/sqb.2014.79.024844) the "cross term", referring to the
$ab$ in $(a+b)^2 = a^2 + 2ab + b^2$. Finally, the dashed line shows the
deep-learning equivalent nonlinearity $\mathrm{ReLU(x-1.0)}$.{/mn} <img
src="img/v2_nonlinearity.png" alt="Nonlinear activation of V2 neurons
enables computation of correlations">

Unfortunately, we have no direct measurements of what each of these neurons
respond to most strongly. However, pre-trained image classification networks
contain units in their early convolutional layers that are, presumably, somewhat
analog to V2 cells. By iteratively adjusting white noise until these units are
maximally activated, we can estimate what kinds of correlations in the input
they are tuned to:

{mn}These images were adapted from an [interactive online
article](https://doi.org/10.23915/distill.00024) by Chris Olah and his
colleagues at OpenAI, who have published lots of neat approaches to explain and
interpret the inner workings of convolutional networks. Note that in the human brain, colour
information is not integrated quite like it is here.{/mn}
<img src="img/v2_texture_neurons.png" alt="Some kernels from Inception V1"/>

On their own, many of these correlations may appear to be meaningless. Together,
however, they describe the local texture of an image. As it turns out, a mere
few dozen of such correlations are enough to fool human texture perception:
we can iteratively generate fake images, starting again from white noise, that result
in the same combination of local averages of these presumed V2 responses as in
the original image.{sn}The first iteration of this
[idea](https://doi.org/10.1023/A:1026553619983) came about in 1999, long before
the heyday of convolutional deep nets, and is due to to Javier Portilla and Eero
Simoncelli. Two decades later, these "Portilla-Simoncelli textures" have
inspired countless psychological studies and attempts to refine the model.{/sn} If the local averaging takes place over a large area, as is
the case in the visual periphery, this can result in very distorted
imagery that nonetheless appears uncannily real:

{mn}The "image metamer" shown here was
[generated](https://dx.doi.org/10.1038%2Fnn.2889) by Jeremy Freeman and Eero
Simoncelli in 2011 based on the same principle of matching image statistics. As
in the human brain, the authors averaged the statistics over a wider area in the
periphery than in the fovea. When focusing strictly on the image center (best viewed
closely or after zooming in), the metamer is difficult to distinguish from the
original.{/mn} <img src="img/metamers.png" alt="From 'Metamers of the ventral
stream'">

As evident here, a mere approximation of these
averaged image statistics measured by V2 is enough to simulate,
with eerie fidelity, how we perceive our visual periphery. This is no coincidence:
after all, higher-level areas (here, V4) precisely respond to
particular configurations of such V2 neurons, so synthesizing images
which evoke similar V2 activations will also result in similar
higher-level perceptions, even if the actual input signals are quite
different.{sn}One could think of this as the bizarro-version of an [adversarial
input](https://en.wikipedia.org/wiki/Adversarial_machine_learning).{/sn}

That V2 neurons so effectively capture local image statistics presents us with a
first opportunity to reify the heretofore vague concept of typographic "colour"
into something concrete and computable: namely, local combinations of such
(simulated) V2 responses. If these remain uniform across the whole page, the
texture is perceived as even:

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

In a truly colour-based letterfitting strategy, which should be relatively easy
to implement, we would iteratively adjust pair distances within an image of text
until a chosen set of V2 responses is nice and uniform across the entire image.
And indeed, this would probably be the most effective and biologically faithful
approach to achieve a perfectly even texture. Unfortunately, in shifting letters
to optimize solely for overall colour, the algorithm would disfigure the
*gestalten* of individual words, at times even rendering them illegible.{sn}In
the theoretical limit, a perfectly uniform texture determined by a fixed number
of such correlations would need to be perfectly periodical, thereby constraining
our test image, at best, to a set of repeating letters.{/sn} Fortunately, the
texture of well-fitted text is typically (but not necessarily) *pretty* even
across the page, but it does not make for a good optimization target.

When V2 neurons detect texture-like correlations between neighbouring V1
neurons, they tend to return inhibitive feedback signals, especially to the V1
neurons in the center. This kind of "surround suppression", which acts in
addition to the lateral inhibition between V1 cells discussed above, helps mute
V1 activity inside similarly-textured areas.{sn}One way to explore potential
neural architectures to accomplish this is via computational modelling; see e.g.
experiments like [this one](https://dx.doi.org/10.1038%2Fnn.4128) by Ruben
Coen-Cagli et al.{/sn} Because this mechanism *leasts* affects the boundaries
between differently-textured surfaces, it allows us to perceive the outlines of
textured objects even when those are weaker (in terms of raw V1 responses) than
the textures themselves: think of a Zebra on the savanna, or of a cluster of
regular strokes on a white background—perhaps a word on a page!

<img src="img/surround_suppression.png" alt="surround suppression example" />

This surround suppression therefore is a kind of early perceptual grouping
mechanism, enabled by correlation-detecting V2 neurons.{sn}Another way to think
of this, from the perspective of [predictive
coding](https://en.wikipedia.org/wiki/Predictive_coding), is as compression of
redundant signals, as Laurence Aitchison and Máté Lengyel [have pointed
out](https://dx.doi.org/10.1016%2Fj.conb.2017.08.010).{/sn} The strength of the
segmentation certainly depends greatly on the scale, pattern, and contrast of
the objects involved, so it is difficult to say to what degree it affects the
perception of words. But inhibitive (as well as facilitatory) feedback is likely
present between higher-level brain areas as well, and the corresponding dynamics
are implicated in other grouping-related phenomena as well, such as *crowding*,
which we will address later.

## Contour integration and V1 feedback

Not all V2 neurons respond to such peculiar V1 correlations, expressing elements of
texture. Some pick up on signals with more human-interpretable salience, such as continuous
edges and lines. Experiments suggest that they do so by responding to V1 complex
cells that co-align:

{mn}Each cell corresponds to a V1 complex cell tuned to a certain
orientation (the distribution in frequency scales is ignored here).
Note that the number of V1 cells is exaggerated for effect. This neuron
responds to collinear V1 activations suggesting the presence of a
horizontal contour, even if curved (see the gray stroke in the sample shown). It may be inhibited by parallel
flanking contours and perpendicular contours, although this is less
clear. This pattern has been called "association field", "bipole",
and many other names in papers going back to the 1990s.{/mn} <img src="img/v2_contour_integration.png"
alt="Receptive fields of a V2 contour integration neuron">

This allows these V2 cells to detect continous contours, even if these
contours are curved or interrupted.{sn}Two studies showing this most clearly are by [Minggui Chen et al. from 2014](https://doi.org/10.1016/j.neuron.2014.03.023) and by [Rujia Chen et al. from 2017](https://doi.org/10.1016/j.neuron.2017.11.004).{/sn} Interrupted contours are a constant
challenge to the vision system: the edges of an object can be
occluded not only by other objects—think tree branches in front of a mountain—but also by the spider web of light-scattering
nerve bundles and capillaries that carpet our retina.{sn}Not to mention our
[blind spot](https://en.wikipedia.org/wiki/Blind_spot_(vision)).{/sn}
Contour-integrating V2 cells thus help us perceive contours even where we cannot
actually see them. Of course, the same principle applies to texture integration across
space.

Having thus detected a piece of contour, the V2 neuron
now sends an amplifying signal to all of its V1 inputs, which
in turn increases the input to the V2 cell itself, creating a
positive feedback loop between V1 and V2. Crucially, however,
this feedback only amplifies neurons that are already firing; it
does not induce activity in other inputs (and may even suppress
them).{sn}Physiologically, this kind of modulatory amplification may be
related to increased spike synchrony between neurons, as explored in
[this 2016 study](https://doi.org/10.1152/jn.01142.2015) by Wagatsuma et
al.{/sn} {mn}<img src="img/contour_integration_example.png" alt="Contour
integration example">Typical contour integration test image demonstrating
contour pop-out. Adapted
from [Roudaia et al.](https://doi.org/10.3389/fpsyg.2013.00356),
2013.{/mn} Thanks to this feedback loop, contiguous contours pop out to
us perceptually in a matter of milliseconds, while non-contour features
(like the dot in the illustration below) do not:

<img src="img/v2_contour_integration_2.png">

This kind of feedback loop is a simple grouping mechanism of its own, and
responsible for many (though not all) observations of *prägnanz* due to
collinearity. As we will see below, however, it is also an important ingredient in
letter and word perception.


## V4 and higher-level areas

The next area of the visual cortex, area V4, mirrors the architecture of V2 in
that it performs a set of convolutions detecting correlations between its
inputs. It is reasonable to conceptualize V4 as V2, only with larger receptive
fields. Its neurons respond, once again, to a large variety of spatial correlations in
the input image, although these correlations can be more complex, looking
perhaps more like this:

{mn}Again, these images are taken from [Olah et al.,
2020](https://doi.org/10.23915/distill.00024). The images give a good
intuition for the higher complexity of the patterns detected in V4.{/mn}
<img src="img/v4_texture_neurons.png" alt="higher-level receptive fields from InceptionNet">

Once again, some neurons tend to be more tuned to textures while others
detect straight or curved contour fragments, although there certainly is overlap
between the two categories.{sn}As in the case in V4, at least in macaques, as shown by studies
like [this one](https://doi.org/10.1523/JNEUROSCI.3073-18.2019) by Anitha
Pasupathy and her collaborators.{/sn} Just as in V2, the contour detectors
integrate smaller contour fragments across a larger region. However, the larger
receptive fields of V4 allow for the target contours to be substantially offset
from the center of the neuron's receptive field. As such, a neuron centered *on*
the target object can detect parts of its contour:

{mn}Note how all shapes have in common the convexity on the lower left.{/mn}
<img src="img/v4_rf.png" alt="Receptive field and some example stimuli for a V4
object-centered contour-detecting cell">

## Perceptual grouping based on border ownership

Consider that navigating our natural environment requires us to correctly
identify three-dimensional objects in three-dimensional space. But the shape of
these objects varies heavily depending on perspective—after all, we only see a
two-dimensional projection of reality—and is available only as a collection of
the abovementioned V4 contour fragments. What's more, the contour detectors will
activate on *both sides* of each object:

{mn}Two V4 contour detectors, tuned to the same eccentricity, angle, and
curvature, activate in response to a dark blob shape. One of them (shown in red)
is centered on the object as expected, the other is centered outside. Many
(though not all) of these detectors are connected mainly to V1 complex cells, rendering
them more responsive to the sheer presence of an edge than to its contrast polarity.{/mn}
<img src="img/v4_rf_outside.png" alt="activation of V4 contour receptor on outside">

How can we recognize a half-overlapped object, discount its perspective foreshortening and assign it a
relative depth, going only by a population of V4 contour detectors, half of
which are gratuitously detecting the objects' outsides? The solution lies in
feedback loops that enable perceptual grouping.


<!--
two categories of neurons are particularly noteworthy: texture
detectors and contour detectors.{sn}Our understanding of V4 is primarily owed to
Anitha Pasupathy and her collaborators, who have been publishing
results like [this one](https://doi.org/10.1152/jn.2001.86.5.2505),
[this one](https://doi.org/10.1152/jn.01265.2006), [this
one](https://doi.org/10.1523/JNEUROSCI.3073-18.2019) and [this
one](https://www.nature.com/articles/s41467-017-02438-8) for nearly two
decades.{/sn} Just as in V2, the contour detectors integrate smaller contour
fragments across some region. However, the larger receptive fields of V4 allow
for the target contours to be substantially offset from the neuron's receptive
field center:
-->

The first feedback loop connects V4 with a special class of V2 neurons called
*border ownership cells* or B-cells. These B-cells, like the V2
contour-integrating cells already discussed, detect the presence of edges based
on the activity of V1 complex cells. While they are agnostic to the edge's
contrast polarity, B-cells fire only if they are on one particular side of an
object. For instance, the B-cell whose receptive field is marked in red below
only detects edges on the *left side* of objects, as indicated here by the small
protrusion pointing toward the right.{sn}Almost everything we know about border
ownership networks is owed to Johns Hopkins researcher Rüdiger von der Heydt and
his students.{/sn}

{mn}Here, the B-cell responds to stimuli 1 and 2, but not 3 and 4.{/mn}
<img src="img/b_cell_1.png" alt="B cell illustration">

This is remarkable. After all, the B-cell only sees a single edge. It cannot know which part of the object it is
on; its receptive field is much too small. So its activity
must be gated by a neuron which does: namely, one of our
higher-level V4 neurons.{sn}Lateral inhibition from other V2 neurons
cannot explain this behaviour, because horizontal connections conduct [too
slowly](https://dx.doi.org/10.1152%2Fjn.00928.2010) to explain
the lab-measured response times of B-cells.{/sn} The object owning the edge
fragment could have any shape and size, so *all* active V4
neurons whose contour templates coincide with the edge fragment send
amplifying signals to our B-cell. In turn, our B-cell directly contributes to their
activation, establishing a positive feedback loop:

<img src="img/bg_feedback_0.png" alt="B-cell feedback loop">

There is an entire population of B-cells, distributed across V2's
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

Research suggests that higher-level cells, perhaps in the posterior inferotemporal
cortex, respond to combinations of V4 contour-detecting neurons centered on the
same retinal location. Such cells effectively group together the borders owned
by an object, and are therefore called G-cells.

{mn}Here, the G-cell is shown as a blurred circle around a center. The blurred
circle corresponds to the location of contours that this G-cell responds to.{/mn}
<img src="img/bg_feedback_2.png" alt="B-cell feedback loop">

Consider the following situation, and make a guess whether at the circled
location, left-side or right-side B-cells would win out:

<img src="img/gestalt_1.png" alt="Gestalt B-cell 1">

Although *technically* the dark shape is a closed, contiguous shape and
therefore on par with the light circle, it is intuitively obvious that
the circle dominates, and even appears to lie above the black shape.
As a result, we can confidently predict that humans will perceive the
circled region as the left side of the circle, and not as the right side
of the dark area. Why is that so?

As it turns out, the vast majority (although not all) of the
object-centered contour detectors in V4 are either straight or
convex in shape, with various degrees of curvature. This has
the profound consequence that convex shapes tend to outcompete
concave shapes in our perception.

In addition, overlapping objects create T-shaped junctions where their
contours meet, as at the top and bottom of the light circle above. In
such situations, lateral inhibition between V4 neurons tends to enhance
the upper object's continuous contour, while suppressing the percept of the acute
angle formed inside the overlapped contour. This interaction helps
strengthen the impression that the light circle lies in the foreground.{sn}See
[here](https://doi.org/10.1523/JNEUROSCI.4766-10.2011) for a painstaking study
of these effects by Brittany Bushnell et al. from the Pasupathy lab.{/sn}

Meanwhile, although the hypothetical square detector served us well in
the examples above, we actually do not know the population of shape
detectors in our inferotemporal cortex. In simulations of perceptual
grouping, it is therefore practical not to think directly about V4
contours and shape detectors. Instead, a popular approach is to
work with a population of representative (if possibly fictitious)
"grouping cells" or G-cells, each of which receives input from, and
in turn feeds back to, a fuzzy annulus of inward-directed B-cells:{sn}The
first to run a simulation of this idea in earnest were [Edward Craft et
al.](https://doi.org/10.1152/jn.00203.2007) in 2011.{/sn}

<img src="img/bg_rfs.png" alt="Receptive fields of G cells">

Given that the V4 contour detectors chiefly pick up convex curvatures
at some eccentricity, and circles are as convex as it gets, an this is
really quite a reasonable model for whatever may truly be going on in
our posterior inferotemporal areas.

To return the square example, consider first a population of coarse-scale G-cells, each of which is connected to
B-cells that make up a circle about the size of our square. Among such
coarse-scale G-cells, only the one centered on the square would respond
noticeably, as it receives input from B-cells on all four sides (red below):

<img src="img/g_responses.png" alt="Sample responses of some G cells">

Finer-scale G-cells would barely respond in most places. They would
receive a bit of input near the square's edges, but due to their
nonlinear activation profile would only really light up inside the
corners, where they receive inputs from B-cells on two sides (purple,
blue). In addition, we may assume that G-cells compete via local
inhibition, such that those cells receiving inputs from more (and from
nearer) B-cells dominate.

Once B-cells and G-cells have settled into an equilibrium, the locus
of peak responses of G-cells across different scales neatly represents
the skeleton of the shape, shown on the right:{sn}The technical term for this feat is
[medial axis transform](https://en.wikipedia.org/wiki/Medial_axis).{/sn}

<img src="img/g_responses_skeleton.png" alt="Sample responses of some G cells,
forming a skeleton">

Skeletonization is critical to object recognition, because it allows us to match
on a shape's underlying geometric structure, instead of its exact contours.{sn}And indeed, IT neurons appear to respond to skeleton fragments, such that a
small population of IT neurons suffices to uniquely identify 3D shapes, as
Chia-Chun Hung and colleagues
[demonstrated](https://doi.org/10.1016/j.neuron.2012.04.029) in Macaque
monkeys.{/sn} Consider, for instance, our ability to recognize the following
four styles of uppercase *E* with the same ease:

{mn}Many different uppercase-E designs exist, but all of them share a
relationship between the relative locations of large-scale G-cell peaks (within
the counters) and smaller-scale peaks (at the terminals).{/mn}
<img src="img/e_skeletons.png" alt="Some skeletons at different scales">

Although the shared features of the skeletons (counters, stems, etc.) appear at
different scales for different letter shapes, they are present in
the same configuration for all of them. 

This is true even for letters that are outlined (last row), as V4
contour detector neurons respond primarily to the contour, not to the
fill (or its absence). Still we can ask: when is a stroke perceived as a
contour, and when does it turn into a shape of its own right, a shape that owns
contours on either side? With letter weights ranging from hairline to
ultra-heavy, this is a particularly salient question:

<img src="img/letter_weights.png" alt="A range of letter weights">

The hairline letter is, arguably, too thin to allow readers to clearly perceive
border ownership of the left and right side of each stem.{sn}Of course this depends
on the font size and the contrast sensitivity function, as discussed earlier.{/sn} Nevertheless, we can
evidently recognize the letter, so it follows that thin lines must be able to excite
fine-scale G-cells even if the ownership of sides is fuzzy. It is worth
remembering also, at this point, that G-cells are merely an abstraction. It is
quite conceivable that some of their biological equivalents are specialized not on
ring-like shapes but thin, straight contours.{sn}This was explored by Brian Hu
et al. in a 2017 [simulation](https://dx.doi.org/10.1007%2Fs10827-017-0659-3).{/sn} 

## Attention, crowding, and the spread of activity

If medial-axis skeletons are the [raw preprocessed ingredient] of object
perception, then 

- Purpose of this section: to gain an appreciation for the conflict between
  wanting activity to spread across the whole word, but also not smush nearby
  letter's stems together, thereby reducing their recognition.

- Skeletons are the fuel of object recognition.

cooking -> prepped ingredients
machining -> 
winemaking -> grapes -> must -> wine
bread -> grain -> flour -> bread
booze -> grain -> mash -> distillation


raw data -> gets transformed -> then properly recognized

If letters and words are perceived based on their skeletons, and the
main objective of letterfitting is to ensure reliable detection of
both letters *and* words, then automating letterfitting requires us to
predict how placing letters at some distance changes their skeletons
relative to their individual skeletons. The goal is to maximize the
perception of two letters as a single object (large-scale skeleton),
while minimizing changes to the skeletons at finer, stem-size scales.

We are going to explore how this might play out between
particular letter pairs—but we first need to establish some intuition for the
neural dynamics at play.

<!--
A powerful arbiter of perceptual grouping, and key ingredient of
reading, is *attention*. In a network ruled by feedback loops and
lateral inhibition, attention is simply a bit of extra activity that
quickly propagates upwards and downwards, strengthening the perception
of a particular image feature while muting its surroundings.

[image]

In everyday parlance, "paying attention" implies looking straight at
an object of interest, and intentionally{sn}By which I merely mean
"triggered by frontal-lobe areas", without endorsing any Cartesian notions of
dualism.{/sn} activating corresponding populations of neurons.
But the more general, mechanistic understanding of attention—simply,
as the amplification of activity in some parts of the network at the
expense of others—includes paying attention to something in the corner
of one's eye ("covert attention") and even attention that is involuntarily
triggered by particular image features ("exogenous attention").

In practice, attention relies on the bidirectionality of the
feedback loops that connect shape detectors to V1 cells: the
appropriate visual input excites the shape detector, but attending
to (i.e., exciting) the shape detector also amplifies any active
V1 cells that are connected to it. This allows us to "select" a
feature corresponding to hundreds of V1 neurons by stimulating just
a single high-level cell.{sn}For a simulation of how this might
play out between G-cells and V1, take a look at Stefan Mihalaş et
al.'s [2011 paper](https://doi.org/10.1073/pnas.1014655108).{/sn}
The selected V1 and V2 neurons, of course, have connections to
many brain regions besides V4, and all of them are indirectly
affected by the initial attention.{sn}This had led cognitive
scientists to call the early visual cortex a ["cognitive
blackboard"](https://doi.org/10.1146/annurev-vision-111815-114443).{/sn}

- When reading, we can focus our gaze on one word and pay covert attention to
  other words.


- 1. Different pieces of the image excite one another, thanks to feedback.
- 2. Different pieces of the image also suppress one another, so that only a few things are active at once. In particular, texturally similar areas suppress their inputs.
- 3. When something stands out from surrounding texture, it is therefore less suppressed, and automatically becomes the strongest neural population.
     We might call this a salient feature, or a feature that exogenously commands attention.
- 4. When we read, we need to perceive words as single units. The letter and word detector units in the visual word form area want to limit their input to one word at a time.
- 5. The challenge is to inject attention in the network at about PIT or V4, and
     have the activity spread sideways such that one word is selected, but have
     the suppression work its magic such that not everything gets selected. The
     brain is great at control theory and does that fine, but the job of a typographer is to make this as quick of a job as possible.

Particularly well-researched is a phenomenon called *crowding*, in which
activity spreads quickly and widely thanks to V2 and V4 cells responsive
to texture-like correlations over large spatial distances. These cells,
with their large receptive fields, are found particularly in the visual
periphery, where the crowding effect is particularly strong. When
crowding is strong, it is nearly impossible to attend to a location,
as any activity is immediately absorbed by the neural populations
representing texture, at the expense of local shape detectors. In the
following illustration, it is very difficult to make out the uppercase V
while focusing on the center cross, even though recognizing the left A, which
is exactly the same distance away, is no problem:

<img src="img/crowding_example.png" alt="Example of crowding between letters">

Text, of course, is inexorably texture-like,{sn}[And not by
accident](https://en.wikipedia.org/wiki/Indo-European_vocabulary); both
*text* and *texture* derive from Proto-Indo-European <em>\*teks–</em>,
meaning "to weave".{/sn} so the excitation of texture detectors and any
concomitant crowding are a fact of life. At first blush, crowded text is
illegible text, and thus to be prevented if possible. The research literature
offers suggestions: colouring the flanking letters, for instance, or putting
lots of space between them.{mn}As a rule of thumb, the spacing needs to be at least half the eccentricity, i.e. to the distance from the fovea (see
Herman Bouma's 1970 report ([DOI](https://doi.org/10.1038/226177a0))). This is
roughly in line with the growth of receptive field diameters. But
careful: despite large distances, any extended regularity in spacing will
still trigger crowding, as Toni Sareela et al. [demonstrated in 2010](https://doi.org/10.1167/10.10.17).{/mn}

Instead I would like to suggest that peripheral crowding may actually
work in our favour, as it limits the volume of letter-like signals
impinging on our reading circuitry, thereby reducing the rate of misreadings.
While 

But crowding even happens in the fovea, depending on the shapes surrounding the
target. The effect is much smaller, but still measurable. For instance, when
given the task below, subjects make fewer mistakes on the left image:

[image]

- These kinds of experiments have made clear that crowding and grouping are really the
  same effect, and that they interact. For example, LAMINART study.

- Ultimately, it's not something we need to directly worry about when letterfitting,
  because we are dealing with pairs of letters at once, and we can assume that
  our algorithm (like a human designer) will fit them in the fovea, without much
  meddling from texture-detecting neurons.

- The dynamics happen so fast, and timing matters, especially when reading fast. Looking at a word or pair is a very different
  activity from reading (learning as a child) or reading (as an adult), and that
  has to be taken into account.



[The link](https://doi.org/10.1109/CIMSIVP.2011.5949241){pdf}https://hal.archives-ouvertes.fr/hal-00706798/file/miconi_t_11_106.pdf{/pdf}


Attention is important to word perception.
-->
<p class="missing">
A feedback model of attentional effects in the visualcortex
</p>

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


## Why word grouping matters: models of reading
<!--
So far, we have described some important neural dynamics of the visual cortex,
between V1 and the early inferotemporal cortex. Experimental results have
yielded rich hypotheses about the neural architecture of perceptual grouping,
hypotheses that appear to explain many aspects of letterfitting practice.

But the patterns of neural activity involved in reading don't stop at the edge
of the visual cortex: about a quarter second after we first see a word, neurons
in the so-called *visual word form area* (VWFA) in our left fusiform gyrus (see
the anatomical illustration above) have settled the identity of the word.

The above sketch of the influence of attention 

Poor letterfitting can affect the performance of the VWFA beyond 

The visual word form area contains neurons that identify letters
and words. Letterfitting can affect the performance of these 

Understanding how this detection works may help us augment our
model to  aware of semantic issues that can affect design
decisions. One common issue is confusability (e.g. between *rn*
and *m*), but we can look beyond alphabetic letterfitting to the
relative placement of accents, and even to the strokes and components
of Hangul and Hanzi{sn}The recognition of Chinese
characters takes place in the *right* fusiform gyrus (the VWFA is in the left), a region
traditionally associated with face recognition (although [EEG
readings suggest that face-recognition circuitry isn't directly
involved](https://doi.org/10.1371/journal.pone.0041103)). The
compositional mechanisms described here likely transfer in principle,
however.{/sn}—all of these are instances of the problem
of competitive perceptual grouping.
-->

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

As explained above, V1 simple cells are typically modelled as responding
linearly via a simple Fourier-domain multiplication with a bank of bandpass filters
$G(s, o)$, where $s$ is
the frequency scale and $o$ the orientation.{sn}[Gabor
patches](https://en.wikipedia.org/wiki/Gabor_filter) are most
commonly used, but many alternative models with better mathematical properties are
available.{/sn} This set of convolutions turns the two-dimensional input image (width × height) into a
four-dimensional tensor of complex numbers (width × height × spatial
frequency scales × orientations), the magnitude and phase angle of
which capture the activation of simple cells $S_\mathrm{V1}$ at every
location:

$$
S_\mathrm{V1}(x, y, s, o) = \mathcal{F}^{-1}(\mathcal{F}(I(x, y)) \mathcal{F}(G(s, o))),
$$

{mn}<img src="img/complex_value.png">{/mn}

where $\mathcal{F}$ is the Fourier transform. For instance, to retrieve
wthe activation of representative simple cells at phases 0°, 90°,
w180° and 270°, one ould half-wave-rectify as follows:

$$
\begin{aligned}
S_{\mathrm{V1, 0\degree}}(x, y, s, o) &= |\mathrm{Re}(S_1(x, y, s, o)| \\
S_{\mathrm{V1, 90\degree}}(x, y, s, o) &= |\mathrm{Im}(S_1(x, y, s, o)| \\
S_{\mathrm{V1, 180\degree}}(x, y, s, o) &= |-\mathrm{Re}(S_1(x, y, s, o)| \\
S_{\mathrm{V1, 270\degree}}(x, y, s, o) &= |-\mathrm{Im}(S_1(x, y, s, o)| \\
\end{aligned}
$$

Traditionally, complex cells were thought to sum the outputs of nearby simple
cells of equal scale and orientation. This is now known to be a gross
oversimplification. In software, a summation-like approach is nevertheless taken to
approximate the output of complex cells $C_{\mathrm{V1}}$, namely a simple computation of the
absolute magnitude of the complex tensor:

$$
C_\mathrm{V1}(x, y, s, o) = |S_\mathrm{V1}(x, y, s, o)|^2
$$

This is often called the *local energy*. The squaring operation shown
here is often used in the literature to approximate the nonlinear
behaviour of complex cells in particular.{mn}<img src="img/hra.png"
alt="HRA"> Solid line: hyperbolic ratio curve, a.k.a. [Hill
function](https://en.wikipedia.org/wiki/Hill_equation_(biochemistry))
or Naka-Rushton function. Dotted line: monotonic polynomial (e.g.
$x^2$).{/mn} Of course, this is a rather unrealistic (if practical)
choice. In a real cells, the firing rate will level off after the input
has been increased beyond some limit. A popular model for this is the
hyperbolic ratio sigmoid

$$y = \frac{fx^k}{\beta^k + x^k}$$

The $f$ scales the curve vertically, $k$ makes the kink steeper, and
$\beta$ shifts the threshold to the right. Consider how the numerator
increases the firing rate, and the denominator decreases it. For
relatively small values of $x$, $\beta^k$ dominates the denominator,
yielding a scaled-down version of $fx^k$ (values of about 2 or 3
are common for $k$, in agreement with the square often used). But
once $x^k$ gets large enough, $\beta^k$ pales in comparison, and
we are left approaching $f$.{sn}This specific activation function
is effectively never used in deep learning, both for historical
reasons and because [its asymptotic behaviour would slow down
training](https://en.wikipedia.org/wiki/Vanishing_gradient_problem).{/sn}

This formula is particularly relevant thanks to *lateral inhibition*,
a common architectural pattern in the brain in which neurons within
a cortical area suppress their neighbours in proportion to their own
firing rate. Locally, this allows the most active neuron to suppress
its neighbours more than those neighbours are able to suppress it in
return. Lateral inhibition thus sharpens peaks and flattens valleys
in the activity landscape; it is a simple and effective way to boost
salient signals relative to the weaker ones that inevitably arise from the
correlations between similarly tuned convolution filters. In V1,
lateral inhibition thus sharpens the orientation and frequency-scale signals,
while also normalizing local contrast.

Because lateral inhibition is a recurrent process that takes time to
reach a steady state, it is most accurately modelled using a system
of coupled differential equations which describe the time dependence of each
neuron's firing rate on its neighbours. Conveniently, however, the
steady-state activations can also be approximated directly using our hyperbolic ratio
model, by simply sneaking the neighbouring neurons' activities into the
denominator:{sn}See [this analysis](https://arxiv.org/pdf/1906.08246.pdf) by
Jesús Malo et al. to understand how this approximation works.{/sn}

$$y_i = \frac{fx_i^k}{\beta^k + \sum_j w_j x_j^k}$$

This approximation is called *divisive normalization*. One can find many
variations on the above formula in the literature: extra constants,
extra square roots in the denominator, extra rectifiers, etc.; but the
core idea is always the same.

This raises the challenge of determining the right values for $w_j$, i.e.
modelling the inhibitive strengths of neighbourly connections. Researchers have
collected formulas,{sn}In 2011, Tadamasa Sawada and Alexander
Petrov compiled a [very long review](https://doi.org/10.1152/jn.00821.2016)
of divisive normalization models of V1. To my knowledge, it is still the most
comprehensive reference today.{/sn} but it is not clear that they capture all of
the interactions there are. What's more, the last decade of research has
revealed that some measured behaviours previously ascribed to lateral inhibition
may instead be the result of feedback from higher-level areas. If nothing else, $w_j$ is probably a convenient place for modellers to incorporate
the effects of spatial frequency dependency (i.e. contrast sensitivity curves).

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


