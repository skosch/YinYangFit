<a name="skeletons-to-words"></a>

## From letter skeletons to words

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
view, even though the title of their article suggests otherwise.{/sn} This means that *n*-gram detectors and word
candidates are activated by multiple words in parallel, and could influence one another in the
process. How, then, does the brain keep different words apart at all? For
instance, what keeps us from reading *hello live* as *hell olive*? 

One plausible explanation is that the activation of the *ol* bigram detector is
a bit weaker in the first pair, whereas the *lo* bigram detector is weaker in
the second. Given our ability to read jumbled letters, this may not seem like a
reliable mechanism. But such ambiguous word pairings are actually extremely
rare, and when they do occur, our grammar-based language circuitry would quickly
resolve any ambiguity. If this hypothesis is correct, then word segmentation is
purely a result of neighbouring words not being able to co-activate *n*-gram
detectors to a sufficient degree to cause any confusion. To prevent accidental
word segmentation, a complete letterfitting model would then need to include a
faithful model of the brain's bigram detectors.

Another possible explanation might be that word-initial and word-final letters
are truly perceived as distinct from word-central letters. If that is true,
letter transpositions which jumble initial or final letters out of place would
effectively amount to letter substitution, rather than mere transposition. And
indeed, *ujmlbde etxt* is much more difficult to decipher than *jmulebd txet*,
although the number of transpositions is equal. If this theory is correct,{sn}Of
course, the two explanations are not mutually exclusive, but some studies (e.g.
<nobr>[Fischer-Baum et al.,
2011](https://doi.org/10.3758/s13423-011-0160-3)<span class="oa" title="Open
Access"></span></nobr>) seem to suggest that initial and final letters could
indeed be processed differently.{/sn} then we must model how an initial- or
final-letter detector would know that the letter in question is, in fact, an
initial or final letter. Because these letter detectors are fed directly by the
skeletons derived from V4 contour fragments, we must assume that word endings are
encoded as V4 contour fragments as well, albeit at a different spatial scale,
which once again brings us back to our Gestalt-analysis approach.
In other words: the word segmentation perspective suggests that grouping between letters
directly counteracts the perception of a word break between them.

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

