<article>

# YinYangFit ☯
*Modelling for automatic letterfitting, inspired by neuroscience*

<img src="img/abstract.png" alt="Abstract"/>

<p class="missing">
This article is only half done. Please free to follow the
project on Github and check back later for more. Thanks :)
</p>

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

## Introduction

Letterfitting refers to the process of adjusting the distances between pairs of
letters{sn}I use the word "letter" very liberally; the more general term is
[glyph](https://en.wikipedia.org/wiki/Glyph)<sup>W</sup>.{/sn} during typeface design.
{mn}<img src="img/spacingkerning.png" alt="Spacing and kerning"><br> Red
vertical bars show side bearings, blue vertical bar shows a negative kern.{/mn}
It's often referred to as "spacing and kerning", because pair distances are the
sum of fixed amounts of space around every letter (so-called *side bearings*)
and additional adjustment values for individual pairs (so-called
*kerns*).{sn}Many existing heuristics try to either auto-space or
auto-kern, which is doomed to fail. See the [appendix](#space_kern_lp) for the
correct mathematical approach to split pair distances into side bearings and kerns.{/sn}
Quality fonts often contain thousands of hand-kerned pairs that undergo weeks of
testing and refinement, all by hand—because surprisingly, there still are no
automated solutions that reliably do the job.{sn}And not for lack of trying:
many approaches exist, the most popular of which are listed in the
[appendix](#existing_tools) below.{/sn}

The heart of the problem: typographers can't even agree what letterfitting
*does*.{sn}As Bertrand Russell put it, "*everything is vague to a degree you do
not realize till you have tried to make it precise.*"{/sn} Some say that it's
about achieving a certain *balance* between letter pairs, the judgment of which
is to spring from the designer's personal aesthetic intuition.{sn}It goes
without saying that as for the design decisions of professional typographers,
*non disputandum est*. This is the premise behind the venerable [kern
game](https://type.method.ac/).{/sn} Others say that the goal is to produce an
"even colour", i.e. a printed page with a uniform texture and without noticeable
blobs of black or white. Yet others have insinuated{sn}First and foremost Frank
Blokland, who in his [PhD thesis](https://www.lettermodel.org/) investigated how
practical considerations in the Renaissance printing trade may have led to a
standardization of font metrics.{/sn} that the distances between letter stems
are really quite arbitrary, and that we are simply conditioned by existing fonts
to (prefer to) read letters at particular pair distances.

All three of the above descriptions seem to point to the same story: that
skilled designers achieve a pleasing visual balance between letter pairs because
they have honed their perception through the careful study of existing fonts.
Coincidentally, perfectly balanced letter pairs also happen to result in
perfect legibility and a perfectly even typographic colour. Does that story hold
water?

As it turns out, research suggests that colour, balance, and legibility have
*different* neural correlates.

<img src="img/introduction_overview.png" alt="Neural correlates of different
typographic concepts">

Evenness of colour is a question of texture perception; quality of balance is a
question of competitive inhibition between perceptual gestalt groups; and
legibility is a question of the reliable detection of letters and n-grams from
pre-processed visual features. Although the three are often in rough agreement, 
optimizing for one does not guarantee a perfect outcome for the others.

The premise behind the letterfitting tools that exist today is that the gaps
between letters can be measured and equalized. But human brains don't perceive
gaps; they perceive shapes whose neural representations interact across space in
particular ways. If we want to develop robust, universal automatic letterfitting
algorithms—algorithms that work on both hairline slab serifs and broad-nib
italics, on both captions and headline sizes, on both Latin and Hangul—then we
need to build better intuitions for the neural dynamics of our vision system.
That's what this article is about.

In a way, it is surprising that type design and cognitive psychology are so
divorced from one another.{sn}The studies that do exist are almost exclusively
empirical (see e.g. the <nobr>[review of legibility
studies](https://doi.org/10.1016/j.visres.2019.05.003)<span class="oa"
title="Open Access"></span></nobr> compiled recently by type legend Charles
Bigelow) but have no explanatory power. In fact, the typesetting of most
preprints suggests that cognitive scientists are altogether unaware of
typography as a discipline.{/sn} Scientists who need cheap, reliable,
machine-readable ground-truth data to validate their computational models of
vision and reading should take a closer look at existing fonts. Conversely, type
designers could massively benefit from tools that emulate aspects of human
vision. I hope to see much more cross-fertilization between the two fields in
the future.

## A letterfitter's objectives 

Before we dive into the details, let's put the three letterfitting objectives fit into
a broader cognitive science context.

### Typographic colour
Typographic colour refers to the visual texture created by the ink on the page.
Most obviously, a darker colour is the result of bolder, narrower, more
tightly-fit type. But the line spacing contributes to a document's
characteristic texture as well, and so does the angle of the letters (i.e.
upright vs. italic) and, ultimately, even the design of the individual letters.

Some design teachers like to give colour-based letterfitting prescriptions, like
"match the black and the white" or "equalize the negative space in the counters with the negative space in the
gaps."{sn}Like horoscopes, these rules only work when they are formulated vaguely enough to
be useless.{/sn} As we will see later, these heuristics are actually primitive descriptions of the kind
of spatial frequency correlations that form the basis of neural texture perception.

### Balance
The brain has a general tendency to group visual features into perceptually coherent objects.
Meanwhile, the typographer's job is to group letters into perceptually coherent words.
When the letters are fitted poorly, the perceptual grouping into words will
fail: this we call poor balance.

{mn}Here, the saturation of the coloured blobs indicates the intensity of
grouping at different scales. Small perceptual groups tend to outcompete larger
ones, so unless the grouping is balanced, the word will be fragmented. The poorly fitted word in the last column triggers the perception of two separate objects, namely the single letter *c* and a pair *at*.{/mn}
<img src="img/grouping_relativity.png" alt="Illustration of the importance of consistency of fit vs absolute distances.">

Perceptual grouping networks are a very fundamental piece of our vision
circuitry, and not exclusive to reading. Their behaviour is often described by
so-called *Gestalt laws*,{sn}"Gestalt", with a hard *G*, is German for "shape"
or "form". The [Gestalt
laws](https://en.wikipedia.org/wiki/Principles_of_grouping)<sup>W</sup> are also
known as the principle of
[Prägnanz](https://en.wikipedia.org/wiki/Gestalt_psychology#Pr%C3%A4gnanz)<sup>W</sup>.{/sn}
which posit that whenever visual signals appear in tightly clustered, connected,
or convex arrangements, we tend to perceive them as unitary objects:

<img src="img/gestalt_laws.png" alt="Illustration of gestalt laws" />

In order to quantify the strength of perceptual grouping between letter pairs, we need
to understand why and how our visual system binds image fragments together.

Psychologists have known about these rules for a over a century.{sn}The pioneers
of Gestalt psychology in the first half of the 20<sup>th</sup> century knew
almost nothing about the brain's vision system, so they naturally fell back on
metaphors drawn from electromagnetics and fluid mechanics. Today, brain
scientists have moved on, but typographers and visual artists still talk
about lights, shadows, bubbles, and force fields. <br/>I recommend
Johan Wagemans et al.'s fantastic two-part historical review of Gestalt
psychology, published in 2012 (<nobr>[part
I](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3482144/)<span class="oa"
title="Open Access"></span></nobr>, [part
II](https://dx.doi.org/10.1037%2Fa0029334)<sup>[PDF](http://gestaltrevision.be/pdfs/A%20century%20of%20Gestalt%20psychology%20in%20visual%20perception%20II.pdf)</sup>).{/sn}
Only in the last two decades have scientists made some headway on teasing apart
the responsible neural circuits, which we will discuss in detail below.

### Legibility
Vision and reading are not the same thing; neither an even texture nor perfectly
balanced pair grouping guarantees good legibility. So where do letter and word
detection enter the story?

As we will see, reading is actually a collection of different modes of
perception, each of which corresponds to a different stage of reading
acquisition in childhood and to a different brain region. A type designer
manipulating letter shapes is performing an entirely different mental task than
someone reading text set in their font. In fact, it appears that most designers
are not directly optimizing for legibility at all. This topic requires a
discussion of the various letter- and word-classifying neural networks in our
brain, of their strengths and weaknesses, and of the importance of word-dividing
spaces in fusional languages like English.

## A brief tour through our visual system: area V1

Our brain's visual processing system is divided into multiple regions, each of
which represents the incoming visual imagery at a different level of
abstraction. Anything we see—landscapes, patterns, text—activates neurons in
each one of these brain areas. While neurons in the lower-level areas respond to
concrete details in the visual input, neurons in higher-level areas respond to
the presence of particular configurations of such details. Lower- and
higher-level areas are equally involved in perception, allowing us to simultaneously
experience the raw visual qualia and comprehend what we see on a more abstract
level.

Whether we are looking at an apple (and recognizing it as such), a tree (and
recognizing it as such), or a word (and reading it): the first few hundred
million neurons are the same. These early brain areas—collectively, the *visual
cortex*—are concerned purely with visual (pre-)processing, not yet with classification.

{mn} All visual input activates several pieces of visual cortex before reaching
dedicated object-detection circuitry such as the Visual Word Form Area (VWFA).
We will discuss mainly V1, V2, and V4 (the so-called [ventral
stream](https://en.wikipedia.org/wiki/Two-streams_hypothesis)<sup>W</sup>); many
other regions exist that are dedicated to visual tasks less relevant to reading,
such as keeping track of moving objects. This big-picture view of reading was
perhaps most clearly articulated in [this 2003
article](https://doi.org/10.1016/S1364-6613(03)00134-7)<sup>[PDF](http://ling.umd.edu/~ellenlau/courses/ling646/McCandliss_2003.pdf)</sup>
by the prolific reading researchers McCandliss, Cohen and Dehaene. As we will
discuss later, the VWFA is actually multiple areas.{/mn} <img
src="img/vision_model.png" alt="Vision model">

Many readers may have had some exposure, however superficial, to the concept of
deep convolutional networks. It is tempting to conceptualize the
architecture of the visual cortex as such a network: yes, raw visual input
enters at the bottom, undergoes convolution through multiple layers, then comes
out at the top as a neat classification of a word. 
But perception, and perceptual grouping in particular, is a dynamic
process. It is not a computation with input and output, but a dance of
electrical activity that evolves through time.{sn}[This interactive
visualization](http://nxxcxx.github.io/Neural-Network/) of a brain is far from
realistic but a much more useful visual metaphor than feed-forward deep
learning diagrams.{/sn} Our goal in this section is to gain an appreciation for these recurrent neural feedback loops.

Of course, feed-forward models have their place. Even at relatively coarse
resolutions, it takes unworkably large computational resources to simulate the
visual cortex' recurrent dynamics accurately. Note, however, that our objective is
*not* to build and train a traditional convolutional net, but rather to design a
human-interpretable, interactively tunable approximation of the perception of
letter pairs.

With that in mind, let's go on a brief tour through our visual system.

### Edge and line detection by simple cells
Sensory input from the eye travels up the optic nerve, through
the lateral geniculate nucleus (LGN) on the brain's thalamus,
to the visual cortex at the very back of the head.{sn}For our
computational purposes, we will ignore any image processing
performed by the retina and thalamus, such as the luminance
adaptation and pooling operations performed by [retinal ganglion
cells](https://en.wikipedia.org/wiki/Retinal_ganglion_cell)<sup>W</sup>.{/sn}

{mn}Illustration adapted from Nicolas Henri Jacob (1781–1871), *Traité complet de l'anatomie de l'homme comprenant la médecine opératoire, par le docteur Bourgery*. Available in the [Anatomia Collection](https://anatomia.library.utoronto.ca/) of the Thomas Fisher Rare Book Library, University of Toronto.{/mn}
<img src="img/vc_anatomy.png" alt="Anatomy; location of the visual cortex">

The first phalanx of cells—the primary visual cortex,
or V1—performs what amounts to a band-filtered wavelet
decomposition. Each neuron here is directly and retinotopically{sn}That is,
neurons are laid out to [roughly mirror the organization of the
retina](https://en.wikipedia.org/wiki/Retinotopy)<sup>W</sup>, such that adjacent
photoreceptors are connected to nearby neurons in the cortex.{/sn}
connected to a small contiguous group of photoreceptors,
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

These neurons are called *simple cells*, and we can easily predict their
response to a given input, depending on the tuning and location of their
receptive fields.{sn}David Hubel and Torsten Wiesel first discovered this in the
1950s. They showed patterns of light to a cat after sticking electrodes into its
brain (Youtube has a [video of said
cat](https://www.youtube.com/watch?v=Yoo4GWiAx94)). The two researchers went on
to win a Nobel Prize for their experiments.{/sn} In software models, the
filtering operation performed by simple cells is typically implemented as
Fourier-domain multiplication with a bank of complex band-pass filters, each of
which is tuned to a particular orientation and spatial frequency.

Leaving the technical details for later sections, here is how sets of
similarly-tuned simple cells would respond to the image of a dark vertical bar:

<img src="img/single_i_example.png" />


### Complex cells
As it turns out, some V1 neurons are less sensitive to phase than others, and
some may even respond equally to both lines and edges, as long as scale and
orientation match their tuning. Those cells are called *complex
cells*.{sn}Simple and complex cells lie along a spectrum of phase specificity,
which is brilliantly explained by [this recent
paper](https://doi.org/10.1101/782151)<sup>[PDF](https://www.biorxiv.org/content/biorxiv/early/2019/09/25/782151.full.pdf)</sup>
by Korean researchers Gwangsu Kim, Jaeson Jang and Se-Bum Paik. But it seems
that there's even more to the story, as complex cells seem to [change their
simpleness
index](https://doi.org/10.1038/nn.2861)<sup>[PDF](https://hal.archives-ouvertes.fr/hal-00660536/document)</sup>
in response to their input as well.{/sn} Thanks to their phase invariance,
complex cells can extract key structural information at the expense of colour
and contrast data. In the following picture, all complex cell responses of a
given frequency scale are shown together, regardless of the orientation:

<img src="img/single_i_complex_example.png" />

It so happens that contrast and colour are mostly irrelevant to reading; after
all, we can read black-on-white just as well as white-on-black. This suggests
that it is mainly complex cells that provide the reading-relevant signals to
higher-level brain areas.{sn}In practice, it is measurably easier to read dark
text on light backgrounds. Not only do light backgrounds make the pupil
contract, <nobr>[creating a sharper
image](http://dx.doi.org/10.1016/j.apergo.2016.11.001)<sup>[PDF](http://jdobr.es/pdf/Dobres-etal-2017-Ambient.pdf)</sup></nobr>,
but V1 outputs are also <nobr>[stronger for darker
colours](https:///doi.org/10.1523/JNEUROSCI.1991-09.2009)<span class="oa"
title="Open Access"></span></nobr>, which may bias shape perception in
higher-level stages. Nevertheless, reading is primarily shape- and not
colour-based.{/sn} Arguably, this contrast invariance holds for texture and Gestalt perception as
well.

To be clear, this does not mean that the signals from simple cells are lost or
discarded. Just like the signals from colour-detecting cells in the so-called
*blob* regions of V1, which are not discussed here, the signals from simple
cells do contribute both to our experience of vision and to the activity of
higher-level brain regions. For reading (and thus letterfitting) purposes,
however, we will focus on the responses of complex cells.

### Lateral inhibition
Neurons in V1, like neurons elsewhere in the brain, use lateral connections to
inhibit their neighbours. This is called *lateral inhibition*. Because the
strength of the inhibition depends directly on the strength of the neuron's own
activation, this setup helps the most active neuron to mute its neighbours. This
sharpens the response landscape, which is helpful considering that given any
visual input, neurons tuned *almost*, but not quite, to the right orientation
and frequency will still fire quite a bit, effectively adding noise to the
signal. Lateral inhibition also reduces the influence of the overall brightness
of the input image, in favour of more local contrast. Lateral inhibition is a
recurrent mechanism, and as such cannot be simulated by a purely feed-forward model.{sn}Deep learning
practitioners achieve similar results by normalizing their datasets and, more
recently, actively factoring out correlations (see e.g. [this 2020
paper](https://arxiv.org/pdf/1905.11926.pdf) by Chengxi Ye and colleagues). We
will stay within the limits of biological plausibility here, but discuss the
classic *divisive normalization* approximation in a later section.{/sn}

### Contrast sensitivity to spatial frequencies
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
*especially* under low-contrast conditions.{sn}See studies like <nobr>[Chung
and Tjan (2009)](https://doi.org/10.1167/9.9.16)<span class="oa" title="Open
Access"></span></nobr>, <nobr>[Oruç and Landy
(2009)](https://doi.org/10.1167/9.9.4)<span class="oa" title="Open
Access"></span></nobr>, and many others.{/sn} This,
of course, is a key reason why e.g. hairline type is difficult to read
at smaller-than-huge sizes and a comparatively loose fit. The reader's
contrast sensitivity function may in fact contribute to the exact relative
weighting of the laterally-inhibitive connections; in other
words, mid-scale signals may outcompete fine-scale signals by default.
Even lacking perfect information about such correlations, we can point
to the contrast sensitivity function as the most basic biological *raison
d'être* for optical sizes in typography, and to letterfitting models based on spatial frequency
channels as a natural fit for this aspect of type design.

We will return to the question of how V1 outputs vary in response to
changing pair distances in a later section. For now, let's move on to how these
signals are processed in subsequent areas.

## Area V2, Portilla-Simoncelli texture correlations, and crowding effects

Area V1 deconstructs the incoming imagery into thousands of edge and line
fragments. Area V2 helps find patterns in those signals, patterns that form the
basis for the perceptual grouping effect we are interested in.

Each neuron in V2 takes its input from a combinations of neurons in
V1,{sn}Again, we will skip here a discussion of the various layers and
interneurons of V2.{/sn} creating receptive fields that can be twice as large as
those in V1. Any particular V2 neuron could take inputs from any variety of V1
neurons that are retinotopically nearby. And indeed, V2 comprises a vast diversity
of cells representing correlations between all kinds of different V1 signals:
correlations between V1 simple cells and complex cells, between V1 cells of
different scales and orientations, and between V1 cells at different spatial
locations. {mn}<img src="img/v1_v2.png" alt="Connections from V1 to V2">V2 cells
take their input from a nearby V1 cells, correlating receptive fields across
dimensions of space, simpleness/complexity, orientation, and spatial frequency
scale.{/mn}

Presumably, the ability to respond to correlations—not just sums—of inputs from V1 is
conferred to V2 neurons by their nonlinear activation curve. Consider a toy
example in which two V1 neurons each fire with rates between 0 and 1.0. Then a V2
neuron with the following activation curve would fire only if *both* inputs are
sufficiently active, summing to at least 1.5, thereby implementing correlation:

{mn}Shown on the left is a hyperbolic ratio function, which we will discuss later.
But even simple squaring nonlinearities would allow computing
correlations; Anthony Movshon and Eero Simoncelli [call
this](https://doi.org/10.1101/sqb.2014.79.024844)<sup>[PDF](http://symposium.cshlp.org/content/early/2015/04/29/sqb.2014.79.024844.full.pdf)</sup> the "cross term", referring to the
$ab$ in $(a+b)^2 = a^2 + 2ab + b^2$. Finally, the dashed line shows the
deep-learning equivalent nonlinearity $\mathrm{ReLU(x-1.0)}$.{/mn} <img
src="img/v2_nonlinearity.png" alt="Nonlinear activation of V2 neurons
enables computation of correlations">

Generally, whenever such a cell is active, it also *reinforces* its input cells via
feedback connections. Such feedback loops are common throughout the brain, and
allow patterns of neural activity to remain stable—at least for a short while,
until new input signals, a shift in attention, or inhibition from other neurons
disrupt the loop. Crucially, this positive feedback only
amplifies neurons that are already firing; it does not induce activity in other
inputs (and may even suppress them).{sn}Physiologically, this kind of modulatory
amplification may be related to increased spike synchrony between neurons, as
explored in <nobr>[this 2016 study](https://doi.org/10.1152/jn.01142.2015)<span
class="oa" title="Open Access"></span></nobr> by Wagatsuma et al.{/sn} {mn}<img
src="img/contour_integration_example.png" alt="Contour integration
example">Typical contour integration test image demonstrating contour pop-out.
Adapted from <nobr>[Roudaia et
al.](https://doi.org/10.3389/fpsyg.2013.00356)<span class="oa" title="Open
Access"></span></nobr>, 2013.{/mn}

Unfortunately, we have no direct measurements of what each of these neurons
respond to most strongly. However, pre-trained image classification networks
contain units in their early convolutional layers that are, presumably, somewhat
analog to V2 cells. By iteratively tweaking white noise until these units are
maximally activated, we can estimate what kinds of correlations in the input
they are tuned to:

{mn}These images were adapted from an <nobr>[interactive online
article](https://doi.org/10.23915/distill.00024)<span class="oa" title="Open
Access"></span></nobr> by Chris Olah and his colleagues at OpenAI, who have
published lots of neat approaches to explain and interpret the inner workings of
convolutional networks. Note that in the human brain, colour information is not
integrated quite like it is here; the important aspect is the correlation
between edge- and line-detecting simple cells and complex cells of various
scales and orientations.{/mn}
<img src="img/v2_texture_neurons.png" alt="Some kernels from Inception V1"/>

There is no clear way for us to segment this population of receptive fields into
a clear taxonomy. But taking some artistic license, we may acknowledge that most
cells detect rather texture-like correlations, while a few select ones are more dedicated to
oriented edges and lines.

### Texture detection via V2 statistics
On their own, many of the texture-like patches may appear to be meaningless.
Taken together, however, they really do describe the local texture of an image. As it
turns out, a mere few dozen of such correlations seem to be almost all that is
needed for human texture perception. In fact, we can iteratively generate fake
images, starting again from white noise, that result in the same combination of
local averages of these presumed V2 responses as in the original image.{sn}The
first iteration of this
<nobr>[idea](https://doi.org/10.1023/A:1026553619983)<sup>[PDF](https://www.cns.nyu.edu/pub/lcv/portilla99-reprint.pdf)</sup></nobr>
came about in 1999, long before the heyday of convolutional deep nets, and is
due to to Javier Portilla and Eero Simoncelli. Two decades later, these
"Portilla-Simoncelli textures" remain a key concept at the heart of many more
sophisticated models of texture.{/sn} If the local averaging takes place over a
large area, as is the case in the visual periphery, this can result in very
distorted imagery that nonetheless appears uncannily real:

{mn}The "image metamer" shown here was
[generated](https://dx.doi.org/10.1038%2Fnn.2889)<sup>[PDF](https://www.cns.nyu.edu/pub/eero/freeman10-reprint.pdf)</sup> by Jeremy Freeman and Eero
Simoncelli in 2011 based on the abovementioned principle of matching image statistics. As
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
input](https://en.wikipedia.org/wiki/Adversarial_machine_learning)<sup>W</sup>.{/sn}

### Texture statistics and letterfitting
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
*gestalten* of individual words, at times even rendering them
illegible.{sn}Consider that in the theoretical limit, a perfectly uniform
texture determined by a fixed number of such correlations would be perfectly
periodical, so an additional constraint (e.g. "letters must not overlap") would
be necessary to preserve enough [useful
information](https://en.wikipedia.org/wiki/Entropy_(information_theory)), but
probably not sufficient to guarantee an aesthetic result at the word level.{/sn}
For that reason, it does not make for a good optimization target, even though
the texture of well-fitted text is typically (but not necessarily) quite even
across the page.

### Surround suppression
Adding to the complexity of the network, texture-detecting V2 neurons return not only
reinforcing feedback but also inhibitive feedback, especially to its V1 inputs
in the center. This kind of "surround suppression", which acts in addition to
the lateral inhibition between V1 cells discussed above, helps mute V1 activity
inside similarly-textured areas.{sn}Although we are mainly interested in
suppressive feedback here, multiple mechanisms seem to be implicated in the
modulation of visual signals; the 2019 <nobr>[EEG
study](https://doi.org/10.1167/19.4.12)<span class="oa" title="Open
Access"></span></nobr> by Schallmo et al. contains a comprehensive review. For
attempts to reproduce the effect using computational modelling, see e.g. the
work of Ruben Coen-Cagli et al.
<nobr>[here](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4624479/)<span
class="oa" title="Open Access"></span></nobr>.{/sn} Because this mechanism
*leasts* affects the boundaries between differently-textured surfaces, it allows
us to perceive the outlines of textured objects even when those are weaker (in
terms of raw V1 responses) than the textures themselves: consider a Zebra on the
savanna, or a cluster of regular strokes on a white background, such as a word
on a page.

<img src="img/surround_suppression.png" alt="surround suppression example" />

This surround suppression therefore is a kind of early perceptual grouping
mechanism, enabled by correlation-detecting V2 neurons.{sn}Another way to think
of this, from the perspective of [predictive
coding](https://en.wikipedia.org/wiki/Predictive_coding)<sup>W</sup>, is as compression of
redundant signals, as <nobr>[pointed out](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5836998/)<span class="oa" title="Open
Access"></span></nobr> by Laurence Aitchison and Máté Lengyel.{/sn} The strength of the
segmentation certainly depends greatly on the scale, pattern, and contrast of
the objects involved, so it is difficult to say to what degree it affects the
perception of words. But inhibitive (as well as facilitatory) feedback is likely
present between higher-level brain areas as well, and the corresponding dynamics
are implicated in other grouping-related phenomena as well, such as *crowding*,
which we will address later.

Finally, it doesn't take a cognitive scientist to know that fonts designed based
on consistent, repeating elements are easier to read.{sn}Still, they have
studied it more thoroughly than one might expect; see <nobr>[this 2012
review](https://doi.org/10.3758/s13414-011-0220-9)<span class="oa" title="Open
Access"></span></nobr> by Thomas Sanocki and Mary Dyson.{/sn} This so-called
"font tuning" has in the past been attributed to an unexplained ability of
letter detectors (which we discuss below) to rapidly adjust their filter kernels
to font designs. But of course, we here have a perfectly parsimonious
explanation in V2 texture correlations: stylistic similarities between letters
are simply redundancies in spatial statistics. Texture-detecting neurons absorb
and suppress them, such that primarily the non-repeating features (i.e.,
terminals and horizontals rather than stems and serifs) maintain enough salience
to excite letter detectors in higher-level areas. In "frankenfonts", such
suppression is impossible, resulting in more irrelevant visual data impinging on
letter detectors, resulting in poorer letter classification performance. Perhaps
future design tools could visualize this mechanism to help designers find
inconsistencies in their fonts.

### Contour integration and V1 feedback

Not all V2 neurons pick up the peculiar, texture-like V1 correlations. Some
detect signals with more human-interpretable salience, such as continuous edges
and lines. Experiments suggest that they do so by responding to V1 complex cells
that co-align:

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
contours are curved or interrupted.{sn}Two studies showing this most clearly are by [Minggui Chen et al. from 2014](https://doi.org/10.1016/j.neuron.2014.03.023)<span class="oa" title="Open Access"></span> and by [Rujia Chen et al. from 2017](https://doi.org/10.1016/j.neuron.2017.11.004)<span class="oa" title="Open Access"></span>.{/sn} Interrupted contours are a constant
challenge to the vision system: the edges of an object can be
occluded not only by other objects—think tree branches in front of a mountain—but also by the spider web of light-scattering
nerve bundles and capillaries that carpet our retina.{sn}Not to mention our
[blind spot](https://en.wikipedia.org/wiki/Blind_spot_(vision))<sup>W</sup>.{/sn}
Contour-integrating V2 cells thus help us perceive contours even where we cannot
actually see them. Of course, the same principle applies to texture integration across
space.

Thanks to the reinforcing feedback loop between such a contour-detecting V2 cell
and its V1 inputs, contiguous contours pop out to us perceptually in a matter of
milliseconds, while non-contour features (like the dot in the illustration
below) do not:

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

{mn}Again, these images are taken from <nobr>[Olah et al.,
2020](https://doi.org/10.23915/distill.00024)<span class="oa" title="Open
Access"></span></nobr>. The images give a good
intuition for the higher complexity of the patterns detected in V4.{/mn}
<img src="img/v4_texture_neurons.png" alt="higher-level receptive fields from InceptionNet">

Once again, some neurons tend to be more tuned to textures while others detect
straight or curved contour fragments, although there certainly is overlap
between the two categories.{sn}Studies like <nobr>[this
one](https://doi.org/10.1523/JNEUROSCI.3073-18.2019)<span class="oa" title="Open
Access"></span></nobr> by Anitha Pasupathy and her collaborators clearly show
this overlap within biological V4 populations, at least in the brains of their macaque monkey
subjects.{/sn} Just as in V2, the contour detectors integrate smaller contour
fragments across a larger region. However, the larger receptive fields of V4
allow for the target contours to be substantially offset from the center of the
neuron's receptive field. As such, V4 neurons centered on a target object can
more easily detect parts of the object's contour:

{mn}Note how all shapes have the convexity on the lower left in common. The
particular V4 neuron shown here responds to objects that are centered in its
receptive field and which exhibit just such a convexity. Indirectly, this V4
neuron detects correlations between a great number of complex cell responses in
V1.{/mn} <img src="img/v4_rf.png" alt="Receptive field and some example stimuli
for a V4 object-centered contour-detecting cell">

V4 neurons, too, form feedback loops with their V2 inputs. V4 neurons, in turn,
serve as input to higher-level brain areas that are more specialized for object detection.

## Perceptual grouping based on border ownership

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
approach is to assume that they are circular:{sn}The first to run a simulation of this idea in earnest were <nobr>[Edward Craft et
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

## Attention, grouping, and crowding
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

## Reading in the brain: from letter skeletons to words

Before we get into the details of possible mathematical descriptions of the
problem, let's briefly review how all of this fits in with recent models of
*reading*. In other words: what happens after V4/LOC, and what does it tell us about
how letterfitting influences legibility?

Researchers broadly agree that reading is based on the same mechanisms as early
vision: convolution and feedback. In a first step, neurons{sn}Or constellations
of neurons, sometimes referred to as *nodes*, but here simply called
*detectors*. Fortunately, we don't need to worry about the intricacies of
population coding here.{/sn} detect the presence of letters from the skeletons
made up of V4 contour fragments. Then, higher-level neurons detect ordered
combinations of these letters; next, combinations of combinations of letters; and those
then eventually activate a population of candidate word detectors associated with
said letter combinations.

Each candidate word detector competes (via lateral inhibition) with the others
and sends positive feedback back to the hierarchy of letter-combination
detectors that activated it. Those also compete. This results in a vigorous
electrical back-and-forth for about a quarter of a second, until activity
settles on the winning word detector. Because the word detectors are largely at
the mercy of the brain's language circuitry that parses sentences based on
grammar and semantic associations, the raw signal from the letter-combination
detectors is easily overruled in our awareness. This allows us to read
misspelled and out-of-order words, often without even noticing them.

### Robust interactivity via *n*-gram detectors
The archetypal letter-combination detector responds to ordered pairs of letters,
often called "open bigrams" in the literature.{sn}Early open-bigram models were
primitive and regularly maligned. Today, the idea is no longer under much dispute, in a
win for its early champions like Jonathan Grainger and Carol Whitney.{/sn} Because letters can appear
anywhere in the retina, and at any size, we must assume that *all* pairs present
in a word will be detected: for instance, the word *cat* will trigger the
detectors for *CA*, *AT*, and *CT*. Due to the inherent softness of the
detectors' filter kernels,{sn}Of course, the "filter kernels" here refer to the
distribution of synapses from input neurons, assumed to be decreasing with
retinotopic distance.{/sn} the exact spatial position of the letters and bigrams
is somewhat uncertain:{sn}One of the first influential reading models featuring such
uncertainty was the 2008 [overlap model](https://doi.org/10.1037/a0012667)<sup>[PDF](https://www.uv.es/~mperea/overlapPsychReview.pdf)</sup> by Gomez, Ratcliff, and Perea.{/sn}

<img src="img/ld_lcd.png" alt="open bigram detection" />

This uncertainty results in the (light, but nonzero) activation of reverse
bigrams, allowing us to read wodrs wiht jmbuled ltetres,{sn}[Jumbled
letters](https://en.wikipedia.org/wiki/Transposed_letter_effect)<sup>W</sup> are
a crowd favourite ever since the infamous [Cambridge
email](http://www.mrc-cbu.cam.ac.uk/people/dennis.norris/personal/cambridgeemail/)
meme. The strength of the effect appears to depend on many factors, including
the [relative position of the
letter](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2662926/)<span class="oa"
title="Open Access"></span> and on <nobr>[the reader's
age](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6542500/)<span class="oa"
title="Open Access"></span></nobr> (curiously, it does not depend on whether the
reader is a human [or a
baboon](https://journals.sagepub.com/doi/abs/10.1177/0956797612474322)<sup>[PDF](https://www.researchgate.net/profile/Johannes_Ziegler3/publication/237147842_Transposed-Letter_Effects_Reveal_Orthographic_Processing_in_Baboons/links/00b7d51c965f40f647000000/Transposed-Letter-Effects-Reveal-Orthographic-Processing-in-Baboons.pdf?origin=publication_detail)</sup>).
English words are particularly forgiving to letter transpositions, while e.g.
Semitic languages are much more sensitive to them, as <nobr>[pointed
out](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3677812/)<span class="oa"
title="Open Access"></span></nobr> by Israeli researcher Ram Frost.{/sn} even
though we have absolutely no trouble distinguishing the letter order between *cat* and
*act*. This surprising ability would be impossible without the
dynamic interactions with a population of word detectors which, in turn, are
gated by our language-comprehension networks.

### Diversity of brain areas involved in reading acquisition
This neat hierarchy of bigram detectors—and more generally, *n*-gram
detectors—takes lots of reading practice to develop, but it is becoming
increasingly clear that this is only one of many steps in the long and awkward
process of reading acquisition.{sn}The summary given here is based primarily on
a well-sourced review preprint
<sup>[PDF](https://psyarxiv.com/g3n2m/download?format=pdf)</sup> by Carol
Whitney and colleagues. Sadly, this was Carol's last paper; she died in late
2019.{/sn} It appears that children first learn to recognize letters as
individual objects, just as they learn to recognize chairs, trees, and fire
trucks. In particular, children develop letter representations in a brain area
otherwise associated with small, graspable objects such as hammers and spoons.
Next, the children learn that these letters, just as other objects and tools,
are associated with sounds. This knowledge appears as novel connections between
the object-associated and the phoneme-associated areas.

Correspondingly, first-graders make letter-by-letter saccades as they sound out
words. After a few years, the grapheme-phoneme associations are strong enough
that five-letter saccades are sufficient; within these five letters, the child
quickly and covertly uses top-down attention shifts to recognize each one.
Notably, this requires the developing *n*-gram detectors to recognize letters
that activate not simultaneously but in sequence.

In experienced adult readers, the *n*-gram detectors appear to be directly
connected to letter-shape detectors the visual cortex, skipping the
object-representation area. The development of this new shortcut is the final
step of learning to read, and these new letter-shape detectors are no longer
associated with any conscious experience of e.g. handling a letter-shaped toy.
We don't lose those original letter-representing neurons—but it appears we don't
make use of them when reading quickly.

### Temporal vs. spatial encoding of *n*-gram sequences
The *n*-gram detectors are trained to detect letters arriving in quick temporal succession, and
experiments suggest that even the "fast" adult letter detectors still activate
the *n*-gram detectors in series, perhaps via lateral and feedback inhibition
coupled with imperceptibly fast (≈16ms) gamma cycles.{sn}See e.g.
SERIOL2<sup>[PDF](https://files.eric.ed.gov/fulltext/ED543279.pdf)</sup> by Whitney and
Marton, which cleverly tests this hypothesis on both left-to-right and
right-to-left readers to confirm the model's assumptions about the effect of the
lateralization of our reading circuitry to the left hemisphere.{/sn} Such a
time-based encoding would also eliminate the need for the enormous number of
retinotopic *n*-gram detectors which would be required in a purely parallel
architecture.

But regardless of whether or not the distance between letters is encoded
temporally or spatially (i.e. using convolutional filters), the activation of
*n*-gram detectors will depend directly on the physical distance between printed
letters. In other words: we read best what we are used to; legibility is a
question of conditioning.{sn}In this narrow but important sense, Frank
Blokland's thesis agrees with the scientific consensus.{/sn}

Of course, this seems disappointing. If conditioning is all that matters, why
not simply copy the metrics from other fonts? How can we justify our tedious
efforts to model neural Gestalt dynamics? The answer, of course, is that the
precise tuning of *n*-gram detectors is only one of several factors in
legibility, and in fact the most forgiving one (it must be, given the
infinitude of different typefaces and reading conditions). Much more
important are letter classification and word segmentation, both of which are
questions of Gestalt.

### Letter classification
{mn}<img src="img/letter_features_bubbles.png" alt="Most salient letter features, as
identified by Fiset et al.">{/mn}
When letters are too tightly clustered, perhaps even overlapping, the performance of
letter detectors will drop. This is not suprising; classic examples are *rn* or *nn* being
misread as *m*. Recall that letter detectors detect G-cell skeletons which are but correlations of V4 contour features, and
each letter detector is particularly tuned to features that most reliably distinguish its
target from other candidates.{sn}This is simply a result of learning. We can visualize the results of empirical studies like [Fiset et al.
(2008)](https://doi.org/10.1111%2Fj.1467-9280.2008.02218.x)<sup>[PDF](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.507.4652&rep=rep1&type=pdf)</sup>
(the source of the image above), [Fiset et al.
(2009)](https://doi.org/10.1080/02643290802421160)<sup>[PDF](http://lpvs-uqo.ca/wp-content/uploads/2016/04/spatio_temporal_dynamics.pdf)</sup>
and [Lanthier et
al.](https://doi.org/10.3758/PBR.16.1.67)<sup>[PDF](https://link.springer.com/content/pdf/10.3758/PBR.16.1.67.pdf)</sup>
to gain an intuition for the features each individual letter detector is most tuned to in human subjects.
{/sn} From a gestalt-optimization perspective, it is the objective of the
letterfitting designer to maintain sufficient distance between letters such that
their medial-axis skeletons do not interfere with each other, *particularly* the parts of
the skeleton most relevant to classification. As we will discuss later, such
interference takes place in spatial frequency channels in V1 even when the letters do not overlap.

Ironically, interference between letters is actually rather negligible in
grid-based approaches{sn}Such as LetterModel, kernagic, the Hz-Program,
etc.{/sn} because their pre-tabulated pair distances are applied between the
letters' outside extrema. Meanwhile, the reading-conditioned *n*-gram detectors
that could actually give some biological plausibility to these methods are
convolutional in nature, anchoring their reference frames on the letter
centroids instead.

### Word segmentation
Besides letter classification, legibility depends on successful word
segmentation, i.e. allowing readers to identify individual words.{sn}Although we
assume here that words are divided by spaces, we must acknowledge that some
scripts don't use [word
dividers](https://en.wikipedia.org/wiki/Word_divider)<sup>W</sup> at all.
[Thai](https://en.wikipedia.org/wiki/Thai_script)<sup>W</sup> and
[Burmese](https://en.wikipedia.org/wiki/Burmese_alphabet)<sup>W</sup> are in
this category, and perhaps also some other [isolating
languages](https://en.wikipedia.org/wiki/Isolating_language)<sup>W</sup>, i.e.
those in which virtually every syllable maps directly onto a [free
morpheme](https://en.wikipedia.org/wiki/Bound_and_free_morphemes)<sup>W</sup>.
After all, in such grammars, word spaces aren't of much use anyway. Koreans
sometimes omit word spaces in
[Hangul](https://en.wikipedia.org/wiki/Hangul)<sup>W</sup> in informal writing,
as well. In [fusional
languages](https://en.wikipedia.org/wiki/Fusional_language)<sup>W</sup> like
English, however, word segmentation is crucial.{/sn} Word segmentation, of
course, is all about perceptual grouping.

Our previous discussions might suggest that during reading, word segmentation
happens as a result of attention spreading outwards to the word boundaries,
thereby allowing us to select a single word at a time. However, experiments
suggest that reality is not that simple. It appears that during fast reading,
multiple words are perceived and processed at once.{sn}Credit for championing
this idea goes mainly to Joshua Snell and his collaborators in Jonathan
Grainger's research group. A key argument is the word transposition effect, in
which word detectors are activated (nearly) in parallel, and our language
comprehension networks pick out words in grammatical sequence: <nobr>*you that
read wrong; you that read wrong, too.*</nobr> See
<nobr>[here](http://dx.doi.org/10.1037/rev0000119)<span class="oa" title="Open
Access"></span></nobr> for their model, and
<nobr>[here](https://doi.org/10.1016/j.tics.2019.04.006)<span class="oa"
title="Open Access"></span></nobr> for a recent review of experimental evidence.
MRI studies by [Alex White et al.
(2019)](https://doi.org/10.1016/j.tics.2019.07.001) appear to support this
view.{/sn} This means that parallel *n*-gram detectors and multiple word
candidates are activated in parallel, and could influence one another in the
process. How, then, does the brain keep different words apart at all? For
instance, what keeps us from reading *hello live* as *hell olive*? 

One plausible explanation is that the activation of the *ol* bigram detector is
a bit weaker in the first pair, whereas the *lo* bigram detector is weaker in
the second. Given our ability to read jumbled letters, this may not seem like a
reliable mechanism. But such ambiguous word pairings are extremely rare, and
when they do occur, our grammar-based language circuitry would quickly resolve
any ambiguity. If this is correct, then word segmentation is purely a result
of neighbouring words not being able to co-activate *n*-gram detectors
sufficiently to cause confusion. To prevent accidental word segmentation, a
letterfitting model would need to contain the entire response curves of bigram
detectors.

Another possible explanation may be that word-initial and word-final letters may
be perceived as distinct from word-central letters. If that were true,
transposing letters such that initial or final letters are jumbled out of place
would effectively amount to letter substitution, rather than mere transposition.
And indeed, *ujmlbde etxt* is much more difficult to decipher than *jmulebd txet*,
although the number of transpositions is equal. 
If this theory is correct,{sn}Of course, the two explanations are not mutually
exclusive.{/sn} then we must model how an initial- or final-letter detector
recognizes that the letter in question coincides with the beginning or end of a
word. Because these letter detectors are fed directly by the skeletons derived
from V4 contour fragments, we may assume that word endings are detected as V4
contour fragments as well, which once again brings us back to our
Gestalt-analysis approach.

<p class="missing">
Still needs clearer explanation. How to justify we can deal with evenly tracked-out text, where spaces are a
relative phenomenon?
</p>

### Human designers fit letters based on gestalt grouping
At this point, it is worth noting that type designers try hard *not* to engage
their reading circuitry when fitting letters. Instead, they adjust letter pairs
by staring straight at them, sometimes flipping them upside down to really see
them "as they are".

That human designers are so successful with such a purely gestalt-based approach
is encouraging: it suggests that gestalt-based algorithms can be used widely,
leading primarily to a perception of visual beauty (or perhaps the absence of
visual distractions), and indirectly to good legibility.{sn}To achieve *optimal*
legibility, designers would need to abandon their current approach and pursue
legibility directly. Perhaps someday we'll see letterfitting based on
double-blinded, randomly-controlled crossover trials of reading speed and
comprehension.{/sn} It may well be that the approach works not only on
alphabetic scripts, but also on the relative placement of strokes and/or
radicals in Hangul and Hanzi.

## From perceptual grouping to letterfitting 
Given a pair of letters, our objective is to minimize the risk that a word boundary
is perceived between them (by fitting them tightly), while preserving the
identity of both letters (by not fitting them *too* tightly).

With B-cells and G-cells, which correspond to configurations of V2 and V4
contour detectors, we now have the vocabulary to describe where and how this
trade-off takes place as the two letters approach one another.

### Losing a letter's skeleton
At the scale of the stem thickness, each letter activates a
population of G-cells corresponding to its medial axis skeleton. Primarily, it
is the letter's ink that gets skeletonized; but in some situations, 
counter-space features might be recruited as well:

<img src="img/skeleton_example.png" alt="Skeletons">

As noted, these skeletons stay relatively invariant across font styles, enabling
letter-detecting neurons to function simply via spatial integration of
particular skeleton features.{sn}Even serifs are simply small extensions of the
skeletal structure that occurs naturally at corners, even in sans-serif
designs.{/sn} Consider now that the skeletonization depends on the activity of
B-cells, but B-cells depend on the activity of V1 complex cells, and those in
turn are affected by the presence of neighbouring letters.

{mn}<img src="img/v1_interference_example.png" alt="V1 interference
example"><br>*Left:* A simple cell activates fully, thanks to the presence of
the left letter's right stem. *Right:* Tigthening the pair places the
neighbouring letter into the cell's receptive field, reducing its
activation.{/mn} To illustrate this point, let's consider a simple cell tuned to
a light-dark-light pattern. The left letter of a pair is positioned such that
its right-hand stem coincides with the "dark" region, activating the cell. We
now move the right letter closer to the left. Eventually, its left stem will
enter the cell's receptive field in the "light" region. Even though the letters
are still a considerable distance apart, this will reduce the cell's activation.
One way to think about this is that to our visual system, whether two letters
are overlapping isn't a binary question; it rather depends on the spatial
frequency in question.

Therefore, in locations where two letters approach very closely, only the
finest-scale complex cell activations will stay intact. This grossly reduces the
activation of B-cells and, in turn, of the G-cells that constitute the skeleton
from them:

{mn}Shown here is an extremely tightly fitted sans-serif, for effect. Serifs
naturally enforce wider gaps.{/mn}
<img src="img/skeleton_example_reduction.png" alt="skeletons">

On top of that, G-cells located in the gap now absorb some activity as well.
This creates ambiguity about the polarity of border ownership in the gap, and the
associated inhibition further dampens the G-cells that make up the stems' skeletons.

<img src="img/skeleton_example_reduction2.png" alt="skeletons">

Note that there is also a set of larger G-cells centered on the gap,
encompassing both letters. This is a classic example of perceptual grouping:
activity corresponding to the left letter's outer edge will filter up to these
larger G-cells, which will feed back to the right letter's outer edge. Attention
can be deployed at different scales, allowing us to shift the polarity of
B-cells to focus on the gap, on either letter, or on the pair as a whole.

The complexity is quite impressive, and we have not yet taken into account
amplifying effects from contour integration, both along the stems and across
gaps, which in turn create illusory T-junctions, which lead to additional
suppression, etc.

Generally, and attentional effects notwithstanding, we need to worry about any
effects that draw neural activity away from the letters' original skeletons. A
computational model must therefore compare the skeletons of the standalone
letters with the skeletons that remain once they are placed together. Different
frequency scales should be weighted differently when the losses are tallied up,
such that degraded stem skeletons are penalized more heavily than degraded
serifs. In more advanced models, pre-trained letter classification networks
could be used to determine the parts of the skeleton most relevant to
distinguishing the letter in question,{sn}This would probably rely on some
salience-mapping technique like [GradCAM](http://gradcam.cloudcv.org/).{/sn} and
penalize losses to these parts most heavily.

### Losing a word's edge
While placing letters too close together puts their skeletons at risk, placing
them too far apart can compromise the integrity of the word as a perceptual group.
This effect is more difficult to model, because letterfitting algorithms deal
with pairs of letters at a time, while words can consist of many, many letters
at once.

A wider-than-average gap in the middle of a word will stand out for multiple
reasons. In long words, it will appear salient because it receives less surround
suppression; it offers less opportunity for horizontal integration
of letter contours along the baseline and x-height; and it evokes the
activation of larger-scale V1 complex cells, translating to a stronger activation of
(more, and larger-scale) B-cells. This, in turn, has a particularly noticeable
effect on G-cells of x-height scale, or larger:

{mn}G-cells of all scales will participate in the activity associated with the
boundary created by the larger gap. Small G-cells involving the inner edge of
the gap will activate quite strongly; this draws neural activity towards the gap
as soon as attention lands near it. Larger G-cells are less active, simply
because they do not receive enough input.{/mn}
<img src="img/wordboundary_gcells.png" alt="g cells at a word boundary">

In principle, this is a natural encoding of word boundaries: gaps that are
wider than average will activate intra-word G-cells more strongly than smaller
gaps. Attention-induced neural activity is therefore more likely to spread up to
such gaps but no further.

The shape of a gap's inner edge can contribute to this effect or weaken it.
Round letters activate G-cells more strongly; *o*'s are so perfectly convex that
even a small gap is sufficient for them to halt the spread of neural activity
beyond it. In alignment with gestalt rules, an *o* is the perfect way to cap off
a string of letters into a optimally rounded-off perceptual group. Type
designers know that to prevent this from fragmenting a word, round letters need
to be fitted more tightly than straight ones. 

When two letters get closer to one another within a word, the risk of
fragmentation at their gap drops thanks to the weakening of the V1 complex cells
that indirectly enable the activation of large, fragmentation-inducing G-cells.
In other words, the same mechanism is responsible for both the degradation of
letter skeletons and for word fragmentation.{sn}We could of course think of word
fragmentation as a degradation of the word skeleton.{/sn}

An effective letterfitting algorithm would quantify this drop in fragmentation
risk, subtract it from the penalty associated with skeleton loss, and
iteratively search for the pair distance that minimizes the resulting total penalty.

But letterfitting algorithms only see two letters at a time. This means that for
some letters, the degree of inherent fragmentation risk appears much lower than
it actually would be in the context of a word:

<img src="img/wordboundary_letters.png" alt="effect of extra letters on g-cells
at word boundary">

Working with more than two letters doesn't solve the problem either: in an
exotic font, letters could be arbitrarily thin or wide. Of course, we *know*
from experience that the width of a letter should have little to no influence
on its tendency to fragment a word, and so it is in the context of other
letters; and yet modelling the pair is difficult.



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


## Building practical letterfitting algorithms

Unfortunately, the dynamism of the scientific model(s) introduced thus far makes
them unsuitable for use in practical letterfitting tools for type designers.
Although it is relatively straightforward to set up systems of coupled differential
equations representing individual neurons, integrating them at a sufficiently
fine spatial resolution is immensely costly, and doing so over many iterations for
each letter combination is outright infeasible, at least with consumer-grade
hardware. We therefore need to consider potential approximations.{sn}Of course,
existing approaches *are* approximations (see the [appendix](#existing_tools) for an
incomplete list).{/sn}

### Modelling activations of V1 cells
As explained above, V1 simple cells are typically modelled as responding
linearly via a simple Fourier-domain multiplication with a bank of bandpass
filters $G(s, o)$, where $s$ is the frequency scale and $o$ the
orientation.{sn}[Gabor
patches](https://en.wikipedia.org/wiki/Gabor_filter)<sup>W</sup> are most
commonly used, but many alternative models with better mathematical properties
are available.{/sn} This set of convolutions turns the two-dimensional input
image (width × height) into a four-dimensional tensor of complex numbers (width
× height × spatial frequency scales × orientations), the magnitude and phase
angle of which capture the activation of simple cells $S_\mathrm{V1}$ at every
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
behaviour of complex cells in particular.

### A simple pair-differential model of interference in V1
Most existing letterfitting algorithms rely purely on geometric features in the
spatial domain, ignoring interference effects in the frequency-domain that result
from the band-pass filtering in V1.

When two letters are far apart, i.e. farther apart than the diameter of the largest relevant
V1 receptive fields, they do not interfere in V1.{sn}This ignores feedback effects from
higher-level areas with larger effective receptive fields.{/sn} In other words: let the
4D tensor of complex-valued simple-cell excitations $S_\mathrm{V1}$ due to the left
letter be called $S_i$, and the one due to the right letter be $S_j$. When the letters
are sufficiently separated, $S_i$ is not affected by the presence of the right
letter, and vice versa.

{mn}<img src="img/v1_interference_example.png" alt="V1 interference
example">{/mn} Consider now a particular simple cell tuned to a light-dark-light
pattern. The left letter is positioned such that its right-hand stem coincides
with the "dark" region, activating the cell to some level $s_i$. We now move the
right letter closer to the left. Eventually, its left stem will enter the cell's
receptive field in the "light" region. Even though the letters are still a
considerable distance apart, this will reduce the cell's activation to a level
lower than $s_{ij}$. One way to think about this is that to our visual system,
whether two letters are overlapping isn't a binary question; it rather depends
on the spatial frequency in question.

Conveniently, we get the magnitude of this reduction for free: because simple
cells are assumed to be just as linear as the Fourier transform, $S_{ij} = S_i +
S_j$, and any reductions correspond to phase cancellations between the
complex-valued $S_i$ and $S_j$.

This offers us a straightforward way to visualize how approaching letter shapes affect
one another's perception in the visual cortex: we simply look at the changes to
the local energy as a result of placing the two letters next to one another:

<img src="img/simple_energy_model.png" alt="Simple energy model">

Note that while the interference $|S_{ij}| - |S_i| - |S_j|$ is always
destructive for simple cells,{sn}By a trivial triangle inequality.{/sn} squaring the magnitudes allows
us to visualize both constructive and destructive interference at the level of
complex cells. Generally, this results in stronger activations in the gap
between letters and a weakening of the letter's edges:

<img src="img/abstract.png">

Granted, this alone does not a letterfitting algorithm make. But this very simple
frequency-based representation already captures many of the geometric
relationships that most existing letterfitting algorithms need to approximate
via heuristics and epicycles.

<p class="missing">
Quickly compare to existing gap quadrature models.
</p>

<p class="missing">
Comment on tuning parameters; pair gains approximate word-scale grouping strength, pair losses
approximate stem-scale losses. Does not consider contour pop-out or actual
grouping dynamics; does quite poorly on uppercase letters.
</p>

<p class="missing">
Explain training this + simple spline or neural net on existing fonts via backprop for a
first approximation. Show results.
</p>






### Modelling lateral inhibition via divisive normalization

{mn}<img src="img/hra.png" alt="HRA"> Solid line: hyperbolic ratio curve, a.k.a.
[Hill
function](https://en.wikipedia.org/wiki/Hill_equation_(biochemistry)<sup>W</sup>)
or Naka-Rushton function. Dotted line: monotonic polynomial (e.g. $x^2$).{/mn}
Of course, the squaring operation in the expression for complex cell activations
is a rather unrealistic (if practical) choice. In a real cells, the firing rate
will level off after the input has been increased beyond some limit. A popular
model for this is the hyperbolic ratio sigmoid

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
training](https://en.wikipedia.org/wiki/Vanishing_gradient_problem)<sup>W</sup>.{/sn}

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
denominator:{sn}See <nobr>[this analysis](https://arxiv.org/pdf/1906.08246.pdf)<span class="oa" title="Open
Access"></span></nobr> by
Jesús Malo et al. to understand how this approximation works.{/sn}

$$y_i = \frac{fx_i^k}{\beta^k + \sum_j w_j x_j^k}$$

This approximation is called *divisive normalization*. One can find many
variations on the above formula in the literature: extra constants,
extra square roots in the denominator, extra rectifiers, etc.; but the
core idea is always the same.

This raises the challenge of determining the right values for $w_j$, i.e.
modelling the inhibitive strengths of neighbourly connections. Researchers have
collected formulas,{sn}In 2011, Tadamasa Sawada and Alexander
Petrov compiled a <nobr>[very long review](https://doi.org/10.1152/jn.00821.2016)<span class="oa" title="Open
Access"></span></nobr>
of divisive normalization models of V1. To my knowledge, it is still the most
comprehensive reference today.{/sn} but it is not clear that they capture all of
the interactions there are. What's more, the last decade of research has
revealed that some measured behaviours previously ascribed to lateral inhibition
may instead be the result of feedback from higher-level areas. If nothing else, $w_j$ is probably a convenient place for modellers to incorporate
the effects of spatial frequency dependency (i.e. contrast sensitivity curves).

### Extending our model to incorporate more dynamics

<p class="missing">
Lots of work missing here ...
</p>

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
The legendary [Hz-Program](https://en.wikipedia.org/wiki/Hz-program)<sup>W</sup> is also
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
Kindersley](https://en.wikipedia.org/wiki/David_Kindersley)'s<sup>W</sup> "wedge method"
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

<a name="space_kern_lp"></a>
<h2 class="appendix">Appendix: Finding side bearings and kerns from pair distances</h2>
Given a set of pair distances (measured as the horizontal component of the line
between outline extrema) $d_{ij}$, where $i$ and $j$ index the left and right
glyph from a set of glyphs $G$, we can find the optimal assignment of side
bearings and kerning values via a simple linear programming model
$$
\begin{aligned}
\mathrm{Min.}&\sum_{i\in G,j\in G} |k_{ij}|\\
\mathrm{such\;that\;}&r_i + k_{ij} + l_j = d_{ij}\quad\forall i \in G, j \in G,\\
\end{aligned}
$$
where $l_i$ and $r_i$ are the left and right side bearings of glyph $i$, and
$k_{ij}$ the kerning value required.

Alternatively, a quadratic objective can be used instead of the sum of
magnitudes,

$$
\begin{aligned}
\mathrm{Min.}&\sum_{i\in G,j\in G} k_{ij}^2\\
\mathrm{such\;that\;}&r_i + k_{ij} + l_j = d_{ij}\quad\forall i \in G, j \in G;\\
\end{aligned}
$$

different formulations will either minimize overall kerning (for best appearance
with applications that do not support kerning, e.g. sprite-based rendering) or maximize the
number of near-zero kerns that can then be eliminated entirely (minimizing file size).

<p class="missing">
More complex optimization models to implement efficient class kerning,  likely via constraint programming.
</p>
