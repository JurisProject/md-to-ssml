const assert = require('assert');
const md2ssml = require('../src');
const fs = require('fs');

describe('md2ssml', function() {
  describe('md2json', function() {
    it('should return plain text with line break', function() {
        var text = 'Plain text.',
            parsedText = md2ssml.md2json.parse(text);

      assert.equal(parsedText.raw, text + '\n\n');
    });

    it('should return heading as section', function() {
        var heading = "Heading 1",
            text = "Plain text.",
            textMd = '# ' + heading + '\n\n' + text,
            parsedText = md2ssml.md2json.parse(textMd);
        
        assert.equal(parsedText[heading].raw, text + '\n\n');
    })
  });
  
  describe('ssml', function() {
    it('should return ssml', function() {
        var ssml = new md2ssml.ssml();
        assert.equal( ssml.say('Hello').pause('1s').ssml(true), "Hello <break time='1s'/>" );
    });

    it('should return ssml with speak tags', function() {
        var ssml = new md2ssml.ssml();
        assert.equal( ssml.say('Hello').pause('1s').ssml(), "<speak>Hello <break time='1s'/></speak>" );
    });
    });

    describe('applyRules', function() {
        it('should take ssml instance and spit out ssml', function() {
            var ssml = new md2ssml.ssml();
            assert.equal( md2ssml.applyRules(ssml, 'Hello', md2ssml.defaultRules['paragraph']).ssml(true), "Hello <break time='1s'/>" )
        })
    })

    describe('parseSections', function() {
        it('should return simple text', function() {
            var ssml = new md2ssml.ssml(),
                parsed = md2ssml.md2json.parse('Hello.');

            assert.equal( md2ssml.parseSections( ssml, parsed ).ssml(true), "Hello.\n\n <break time='1s'/>");
        })

        it('should return section', function() {
            var ssml = new md2ssml.ssml(),
                parsed = md2ssml.md2json.parse('# Heading 1\n\nHello.');

            assert.equal( md2ssml.parseSections( ssml, parsed ).ssml(true), "Heading 1 <break time='1s'/> Hello.\n\n <break time='1s'/>");
        })

        it('should return nested sections', function() {
            var ssml = new md2ssml.ssml(),
                parsed = md2ssml.md2json.parse('# Heading 1\nHello.\n## Heading 2\nGood Bye');

            assert.equal( md2ssml.parseSections( ssml, parsed ).ssml(true), [
                "Heading 1 <break time='1s'/>",
                "Hello.\n\n <break time='1s'/>",
                "Heading 2 <break time='1s'/>",
                "Good Bye\n\n <break time='1s'/>"].join(' '));
        })

        it('should return deeper nested sections', function() {
            var ssml = new md2ssml.ssml(),
                parsed = md2ssml.md2json.parse('# Heading 1\nHello.\n## Heading 2\nGood Bye\n### Heading 3\nWhat?');

            assert.equal( md2ssml.parseSections( ssml, parsed ).ssml(true), [
                "Heading 1 <break time='1s'/>",
                "Hello.\n\n <break time='1s'/>",
                "Heading 2 <break time='1s'/>",
                "Good Bye\n\n <break time='1s'/>",
                "Heading 3 <break time='1s'/>",
                "What?\n\n <break time='1s'/>"
            ].join(' '));
        })

        it('should return deeper nested sections and multiple sections', function() {
            var ssml = new md2ssml.ssml(),
                parsed = md2ssml.md2json.parse('# Heading 1\nHello.\n## Heading 2\nGood Bye\n### Heading 3\nWhat?\n## Heading 2.1\nWhere?');

            assert.equal( md2ssml.parseSections( ssml, parsed ).ssml(true), [
                "Heading 1 <break time='1s'/>",
                "Hello.\n\n <break time='1s'/>",
                "Heading 2 <break time='1s'/>",
                "Good Bye\n\n <break time='1s'/>",
                "Heading 3 <break time='1s'/>",
                "What?\n\n <break time='1s'/>",
                "Heading 2.1 <break time='1s'/>",
                "Where?\n\n <break time='1s'/>"
            ].join(' '));
        })

        it('should parse a complex file', function() {
            var ssml = new md2ssml.ssml(),
                parsed = md2ssml.md2json.parse(fs.readFileSync('./test/test.md','utf8')),
                ssmlText = md2ssml.parseSections( ssml, parsed ).ssml();
            
            fs.writeFileSync('./test/test.ssml', ssmlText, 'utf8');

            assert.equal( ssmlText, "Heading 1 <break time='1s'/> Hello.\n\n <break time='1s'/>");
        })
    })

    describe('md2ssml', function() {
        it('should return false if empty string', function() {
            var textMd = md2ssml.md2ssml();

            assert.equal(textMd, false);
        })

        it('should return simple parsed ssml', function() {
            var text = "Plain text.",
                textMd = md2ssml.md2ssml(text);

            assert.equal( textMd, "Plain text.\n\n <break time='1s'/>");
        })

        it('should return header parsed ssml', function() {
            var text = "# Header 1\n\nPlain text.",
                textMd = md2ssml.md2ssml(text);

            assert.equal( textMd, "Header 1 <break time='1s'/> Plain text.\n\n <break time='1s'/>");
        })
    })
});

