--[[
-- This is a super hacky regex script to convert {sn}...{/sn} and {mn}...{/mn}
-- to the kind of toggle-able margin notes used with the Tufte CSS file used
-- here.
--]]

mni = 1  -- The running index of the marginnotes/sidenotes

function Str (elem)
  has_marginnote_tag = string.find(elem.text, "{mn}")
  has_marginnote_endtag = string.find(elem.text, "{/mn}")
  has_sidenote_tag = string.find(elem.text, "{sn}")
  has_sidenote_endtag = string.find(elem.text, "{/sn}")

  if has_marginnote_tag then -- marginnotes are the ones without number.
    id = "marginnote-" .. mni
    mni = mni + 1
    marginnote_tag_before, marginnote_tag_after = string.match(elem.text, "(.-){mn}(.*)")
    return pandoc.RawInline("html", (marginnote_tag_before or "") .. "<input type=\"checkbox\" id=\"mn-" .. id .. "\" class=\"margin-toggle\"><label for=\"mn-" .. id .. "\" class=\"margin-toggle\"></label><span class=\"marginnote\">" .. (marginnote_tag_after or ""))

  elseif has_marginnote_endtag ~= nil then
    marginnote_endtag_before, marginnote_endtag_after = string.match(elem.text, "(.-){/mn}(.*)")
    return pandoc.RawInline("html", (marginnote_endtag_before or "") .. "</span>" .. (marginnote_endtag_after or ""))

  elseif has_sidenote_tag ~= nil then -- sidenotes have numbers in the text.
    id = "sidenote-" .. mni
    mni = mni + 1
    sidenote_tag_before, sidenote_tag_after = string.match(elem.text, "(.-){sn}(.*)")
    return pandoc.RawInline("html", (sidenote_tag_before or "") .. "<input type=\"checkbox\" id=\"sn-" .. id .. "\" class=\"margin-toggle\"><label for=\"sn-" .. id .."\" class=\"margin-toggle sidenote-number\"></label><span class=\"sidenote\">" .. (sidenote_tag_after or ""))

  elseif has_sidenote_endtag ~= nil then
    sidenote_endtag_before, sidenote_endtag_after = string.match(elem.text, "(.-){/sn}(.*)")
    return pandoc.RawInline("html", (sidenote_endtag_before or "") .. "</span>" .. (sidenote_endtag_after or ""))

  else
    return elem
  end
end
