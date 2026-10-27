LATEXMK = latexmk -xelatex -interaction=nonstopmode -halt-on-error

.PHONY: all pdf notes clean

all: pdf notes

# Чисті слайди -> main.pdf
pdf:
	$(LATEXMK) main.tex

# Слайди з нотатками доповідача на другому екрані -> main-notes.pdf
notes:
	$(LATEXMK) main-notes.tex

# Прибрати проміжні файли (PDF лишаються)
clean:
	latexmk -c main.tex main-notes.tex
	rm -f *.xdv *.nav *.snm *.vrb *.synctex.gz
