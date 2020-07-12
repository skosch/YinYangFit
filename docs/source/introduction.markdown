## Text samples

<p class="missing">
Render text samples
</p>


## Motivation

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

## Key Concepts

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

## Prior art

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

<a name="intro-summary"></a>

## Automatic letterfitting (in 3 minutes)

* First, simulate V1C responses and weight by scale, to emulate contrast sensitivity function / optical sizing.
* Then, apply a series of V4 contour filters and combine them to detect circular pieces.
* Then, combine these to detect distances.
* Then, reward the right distance.
* Then, penalize harmful proximity.
